import Node from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";
import { DateTime } from "luxon"

export type ExtractProps = {
  contentType:
    | "median"
    | "time"
    | "DBSCAN"
    | "kriging"
    | "trilaterate"
    | "address";
};

@MapAggregateNode("Extract", "Extract semantic information from each payload")
export default class Extract extends Node<ExtractProps> {
  async process(
    input: Payload[],
    params?: Partial<ExtractProps>
  ): Promise<Payload[]> {
    console.log("Runtime params", params);
    const { contentType } = this.getLocalParams(params);
    console.log("ExtractTime", contentType)
    let payload: Payload;
    switch (contentType) {
      case "median":
        payload = getMedian(input);
        break;

      case "time":
        return annotateTime(input);

      default:
        throw new Error(`Unsupported Extract contentType: ${contentType}`)
    }
    return [payload];
  }

  getSchema(): Schema<Required<ExtractProps>> {
    return {
      contentType: {
        description: "The type of content to extract from the payloads",
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
