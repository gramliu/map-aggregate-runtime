import Node from "@core/Node";
import Payload from "@core/Payload";
import Schema from "@core/Schema";
import { MapAggregateNode } from "@core/index";

type ExtractProps = {
  contentType: "median" | "ARIMA" | "DBSCAN" | "kriging" | "trilaterate";
};

@MapAggregateNode("Extract", "Extract semantic information from payloads")
export default class Extract extends Node<ExtractProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    let payload: Payload;
    switch (this.params.contentType) {
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
