import axios from "axios";
import { MapAggregateNode, Node } from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";

type InjectProps = {
  data: Payload[];
};

@MapAggregateNode("Inject", "Inject arbitrary data for debugging")
export default class Inject extends Node<InjectProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    return this.params.data;
  }

  getSchema(): Schema<InjectProps> {
    return {
      data: {
        description: "The payloads to inject",
        defaultValue: [],
      },
    };
  }
}
