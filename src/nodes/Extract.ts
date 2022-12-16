import Node from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import {MapAggregateNode} from "../core";
import {DateTime} from "luxon"
import {SpatialUnit} from "./Pull";
import kriging from "@sakitam-gis/kriging"
import convert from "convert"
import {computeDestinationPoint} from "geolib";

export type KrigingModel = "gaussian" | "exponential" | "spherical"

export type ExtractProps = {
    contentType:
        | "median"
        | "time"
        | "DBSCAN"
        | "krigingMap"
        | "trilaterate"
        | "address";

    lat?: number;
    lng?: number;
    radius?: number;
    radiusUnit?: SpatialUnit;
    krigingModel?: KrigingModel;
    krigingVariance?: number;
    krigingAlpha?: number;
    krigingGranularity?: number;
};

@MapAggregateNode("Extract", "Extract semantic information from each payload")
export default class Extract extends Node<ExtractProps> {
    async process(
        input: Payload[],
        params?: Partial<ExtractProps>
    ): Promise<Payload[]> {
        const localParams = this.getLocalParams(params);
        const {
            contentType,
            lat,
            lng,
            radius,
            radiusUnit,
            krigingModel,
            krigingVariance,
            krigingAlpha,
            krigingGranularity
        } = localParams;
        switch (contentType) {
            case "median":
                return [getMedian(input)];

            case "time":
                return annotateTime(input);

            case "krigingMap":
                const requiredFields = ["lat", "lng", "radius", "radiusUnit", "krigingModel", "krigingVariance", "krigingAlpha", "krigingGranularity"] as (keyof ExtractProps)[]
                const missing = requiredFields.filter(field => localParams[field] == null)
                if (missing.length > 0) {
                    throw new Error(`Missing required krigingMap fields: ${missing}`)
                }
                const radiusMeters = convert(radius, radiusUnit.toLowerCase() as Lowercase<SpatialUnit>).to("meters")
                return createKrigingMap(input, lat, lng, radiusMeters, krigingModel, krigingVariance, krigingAlpha, krigingGranularity);

            default:
                throw new Error(`Unsupported Extract contentType: ${contentType}`)
        }
    }

    getSchema(): Schema<Required<ExtractProps>> {
        return {
            contentType: {
                description: "The type of content to extract from the payloads",
            },
            lat: {
                description: "The latitude of the center point to use for location-based operations"
            },
            lng: {
                description: "The longitude of the center point to use for location-based operations"
            },
            radius: {
                description: "The radius from the center point to use for area-based operations"
            },
            radiusUnit: {
                description: "The spatial unit (meters, kilometers, miles) used in the radius",
                defaultValue: "METERS"
            },
            krigingModel: {
                description: "The kriging model to use (gaussian, exponential, spherical)",
                defaultValue: "spherical"
            },
            krigingVariance: {
                description: "The variance of the noise process used for kriging",
                defaultValue: 0.2
            },
            krigingAlpha: {
                description: "The alpha parameter to be used in kriging",
                defaultValue: 0.5
            },
            krigingGranularity: {
                description: "Short-edge granularity (number of points) used by kriging",
                defaultValue: 5
            },
        };
    }
}

/**
 * Returns the median payload from the input.
 * @throws Error if there are no matching payloads
 */
function getMedian(payloads: Payload[]): Payload {
    const sorted = payloads.sort((payloadA, payloadB) =>
        payloadA > payloadB ? 1 : -1
    );
    if (sorted.length == 0) {
        throw new Error("No matching payloads for median!");
    }
    return payloads[sorted.length / 2];
}

/**
 * Annotate time on payloads with millis timestamps
 */
function annotateTime(payloads: Payload[]): Payload[] {
    return payloads.map((payload) => {
        if (payload.timestamp == null) {
            throw new Error("Missing timestamp on payload!");
        }

        const dateTime = DateTime.fromMillis(payload.timestamp);
        return {
            ...payload,
            second: dateTime.second,
            minute: dateTime.minute,
            hour: dateTime.hour,
            day: dateTime.day,
            month: dateTime.month,
            year: dateTime.year,
        }
    });
}

/**
 * Create a Kriging noise map
 * @see https://oeo4b.github.io/
 */
function createKrigingMap(payloads: Payload[], lat: number, lng: number, radiusMeters: number, model: KrigingModel, variance: number, alpha: number, granularity: number): Payload[] {
    const tArray = payloads.map(payload => payload.contentValue as number);
    const xArray = payloads.map(payload => payload.lon)
    const yArray = payloads.map(payload => payload.lat);

    const variogram = kriging.train(tArray, xArray, yArray, model, variance, alpha);
    const length = 2 * radiusMeters;
    const interval = length / granularity;

    // top-left points (d = r * sqrt(2) from origin)
    const {longitude: startX, latitude: startY} = computeDestinationPoint({lng, lat}, radiusMeters * Math.sqrt(2), -45)

    // (granularity x granularity) 2D array
    const grid = new Array(granularity).fill(0).map(_ => new Array(granularity).fill(0))
    for (let i = 0; i < granularity; i++) {
        for (let j = 0; j < granularity; j++) {
            const dx = i * interval
            const dy = j * interval
            const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))

            // Need to transform degree to -degree + 90
            let deg = -90;
            if (dx != 0) {
                deg = - Math.atan(-dy / dx) * (180 / Math.PI) + 90;
            }

            const {longitude: x, latitude: y} = computeDestinationPoint({lng: startX, lat: startY}, d, deg)
            const pred = kriging.predict(
                x,
                y,
                variogram
            )
            grid[i][j] = {
                contentType: "krigingMap",
                contentValue: pred,
                row: i,
                col: j
            }
        }
    }

    return grid.flat();
}
