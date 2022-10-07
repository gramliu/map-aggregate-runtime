import Node from "../core/Node";
import Payload, { ScalarType } from "../core/Payload";
import Schema from "../core/Schema";
import getMatchingPayloads from "../util/getMatchingPayloads";
import { MapAggregateNode } from "../core";

type FilterOperation =
  | "==="
  | "!=="
  | ">"
  | ">="
  | "<"
  | "<="
  | "includes"
  | "not includes";

type FilterProps = {
  operation: FilterOperation;
  target: string;
  targetValue: ScalarType;
};

@MapAggregateNode("Filter", "Filter payloads based on a predicate")
export default class Filter extends Node<FilterProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    const { operation, target, targetValue: comparisonValue } = this.params;
    const matchingTarget = getMatchingPayloads(input, target);
    const predicate = getPredicate(operation);
    return matchingTarget.filter((payload) =>
      predicate(payload.contentValue, comparisonValue)
    );
  }

  getSchema(): Schema<Required<FilterProps>> {
    return {
      operation: {
        description:
          "The operation to use to compare against comparisonValue. Order: (payload value) [operation] (comparisonValue)",
        defaultValue: "===",
      },
      target: {
        description: "The target property on the payload to compare",
        defaultValue: "contentValue",
      },
      targetValue: {
        description: "The value to compare against",
      },
    };
  }
}

/**
 * Returns the predicate function corresponding to the specified operation
 */
function getPredicate(
  filterOperation: FilterOperation
): (value: ScalarType, comparison: ScalarType) => boolean {
  switch (filterOperation) {
    case "===":
      return (a, b) => a === b;

    case "!==":
      return (a, b) => a !== b;

    case ">":
      return (a, b) => a > b;

    case ">=":
      return (a, b) => a >= b;

    case "<":
      return (a, b) => a < b;

    case "<=":
      return (a, b) => a <= b;

    case "includes":
      return (a: string, b: string) => a.includes(b);

    case "not includes":
      return (a: string, b: string) => !a.includes(b);
  }
}
