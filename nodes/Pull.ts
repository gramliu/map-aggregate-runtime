import axios from "axios";
import { MapAggregateNode, Node } from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";

type PullProps = {
  url: string;
  method: "GET" | "POST" | "PUT";
};

@MapAggregateNode("Pull", "Retrieve data from a remote source")
export default class Pull extends Node<PullProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    const { data } = await axios({
      url: this.params.url,
      method: this.params.method,
    });
    if (Array.isArray(data)) {
      return data;
    } else {
      return [data];
    }
  }

  getSchema(): Schema<PullProps> {
    return {
      url: {
        description: "URL to pull data from",
        defaultValue: "https://google.com",
      },
      method: {
        description: "REST method to use",
        defaultValue: "GET",
      },
    };
  }
}
