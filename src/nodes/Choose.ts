import Node from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

type ChooseProps = {
  count: number;
};

@MapAggregateNode("Choose", "Choose the first k payloads")
export default class Choose extends Node<ChooseProps> {
  async process(
    input: Payload[],
    params?: Partial<ChooseProps>
  ): Promise<Payload[]> {
    const { count } = this.getLocalParams(params);
    if (input.length < count) {
      return input;
    } else {
      return input.slice(0, count);
    }
  }

  getSchema(): Schema<Required<ChooseProps>> {
    return {
      count: {
        description:
          "The number of payloads to select. If there are less payloads, all are sent",
      },
    };
  }
}
