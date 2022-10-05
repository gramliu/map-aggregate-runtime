import Payload from "@core/Payload";
import Schema from "@core/Schema";
import getMatchingPayloads from "@util/getMatchingPayloads";
import MapAggregateNode from "@core/MapAggregateNode";
import Node from "@core/Node";

type RankProps = {
  target: string;
};

@MapAggregateNode("Rank", "Rank payloads based on a target property")
export default class Rank extends Node<RankProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    const target = this.params.target;
    const matching = getMatchingPayloads(input, target);
    return [...matching].sort((payloadA, payloadB) =>
      payloadA[target] > payloadB[target] ? 1 : -1
    );
  }

  getSchema(): Schema<Required<RankProps>> {
    return {
      target: {
        description: "The field to sort by",
        defaultValue: "contentValue",
      },
    };
  }
}
