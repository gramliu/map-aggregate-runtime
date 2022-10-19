import Node from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

type TemporalUnit =
  | "MILLIS"
  | "SECONDS"
  | "MINUTES"
  | "HOURS"
  | "DAYS"
  | "MONTHS"
  | "YEARS";

type SpatialUnit = "METERS" | "KILOMETERS" | "MILES";

type PullProps = {
  staleness: number;
  stalenessUnit: TemporalUnit;
  interval: number;
  intervalUnit: TemporalUnit;
  lat: number;
  lng: number;
  radius: number;
  radiusUnit: SpatialUnit;
};

@MapAggregateNode(
  "Pull",
  "No-op that describes the frequency and location of data collection"
)
export default class Choose extends Node<PullProps> {
  async process(
    input: Payload[],
    params?: Partial<PullProps>
  ): Promise<Payload[]> {
    return input;
  }

  getSchema(): Schema<Required<PullProps>> {
    return {
      staleness: {
        description: "The maximum amount of time to store data for",
      },
      stalenessUnit: {
        description:
          "The temporal unit (seconds, minutes, etc.) used in the staleness",
        defaultValue: "DAYS",
      },
      interval: {
        description: "The frequency of data collection",
      },
      intervalUnit: {
        description:
          "The temporal unit (seconds, minutes, etc.) used in the interval",
        defaultValue: "HOURS",
      },
      lat: {
        description: "The latitude of the center point that is being queried",
      },
      lng: {
        description: "The longitude of the center point that is being queried",
      },
      radius: {
        description: "The radius from the center point to query data from",
      },
      radiusUnit: {
        description:
          "The spatial unit (meters, kilometers, miles) used in the radius",
        defaultValue: "METERS",
      },
    };
  }
}
