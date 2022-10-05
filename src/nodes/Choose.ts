import Node from "@core/Node";
import Payload from "@core/Payload";
import Schema from "@core/Schema";
import { MapAggregateNode } from "@core/index";

type ChooseProps = {
  count: number;
};

@MapAggregateNode("Choose", "Choose the first k payloads")
export default class Choose extends Node<ChooseProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    if (input.length < this.params.count) {
      return input;
    } else {
      return input.slice(0, this.params.count);
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
