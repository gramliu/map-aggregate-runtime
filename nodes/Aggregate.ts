import Schema from "../core/Schema";
import { Node, MapAggregateNode } from "../core/Node";
import Payload from "../core/Payload";

type AggregateProps = {
  target: string;
  operation: "count" | "average" | "sum";
};

@MapAggregateNode("Pull", "Retrieve data from a remote source")
class Aggregate extends Node<AggregateProps> {
  process(input: Payload[]): Promise<Payload[]> {
    throw new Error("Method not implemented.");
  }

  getSchema(): Schema<AggregateProps> {
    return {
      target: {
        description: "The target field on each payload to aggregate from",
      },
      operation: {
        description: "The aggregation operation to perform",
        defaultValue: "count",
      },
    };
  }
}
