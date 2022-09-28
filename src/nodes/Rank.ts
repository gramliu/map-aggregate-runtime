import { MapAggregateNode, Node } from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import { getMatchingPayloads } from "./Aggregate";

type RankProps = {
  target: string;
};

@MapAggregateNode("Rank", "Rank payloads based on a target property")
export default class Rank extends Node<RankProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    return this.rankPayloads(input, this.params.target);
  }

  getSchema(): Schema<RankProps> {
    return {
      target: {
        description: "The field to sort by",
        defaultValue: "contentValue",
      },
    };
  }

  /**
   * Sorts the payloads based on the `target` field
   */
  rankPayloads(
      input: Payload[],
      target: string = "contentValue"
  ): Payload[] {
    const matching = getMatchingPayloads(input, target);
    return [...matching].sort((payload) => payload[target]);
  }
}
