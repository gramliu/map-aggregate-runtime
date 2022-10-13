import Node from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

type ExtractProps = {
  contentType:
    | "median"
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
    const { contentType } = this.getLocalParams(params);
    let payload: Payload;
    switch (contentType) {
      case "median":
        payload = this.getMedian(input);
        break;
    }
    return [payload];
  }

  getSchema(): Schema<Required<ExtractProps>> {
    return {
      contentType: {
        description: "The type of content to extract from the payloads",
        defaultValue: "median",
      },
    };
  }

  /**
   * Returns the median payload from the input.
   * @throws Error if there are no matching payloads
   */
  getMedian(input: Payload[]): Payload {
    const sorted = input.sort((payloadA, payloadB) =>
      payloadA > payloadB ? 1 : -1
    );
    if (sorted.length == 0) {
      throw new Error("No matching payloads for median!");
    }
    return input[sorted.length / 2];
  }
}
