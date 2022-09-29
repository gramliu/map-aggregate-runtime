import { MapAggregateNode, Node } from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";

type InjectProps = {
  data: Payload[];
};

@MapAggregateNode("Inject", "Inject arbitrary data for debugging")
export default class Inject extends Node<InjectProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    if (input != null) {
      return input;
    } else {
      return this.params.data;
    }
  }

  getSchema(): Schema<Required<InjectProps>> {
    return {
      data: {
        description: "The payloads to inject",
        defaultValue: [],
      },
    };
  }
}
