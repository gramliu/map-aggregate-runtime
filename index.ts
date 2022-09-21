import Schema from "src/Schema";
import { Node, MapAggregateNode } from "./src/Node";
import Payload from "./src/Payload";

type PullProps = {
  url: string;
  description: string;
};

@MapAggregateNode("Pull", "Retrieve data from a remote source")
class Pull extends Node<PullProps> {
  process(input: Payload[]): Promise<Payload[]> {
    throw new Error("Method not implemented.");
  }

  getSchema(): Schema<PullProps> {
    return {
      url: {
        description: "URL to pull data from",
        defaultValue: "https://google.com",
      },
      description: {
        description: "REST method to use",
        defaultValue: "GET",
      },
    };
  }
}

const pullFacebook = new Pull({
  url: "google.com",
  description: "GET",
});
