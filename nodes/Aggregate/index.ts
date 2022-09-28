import { MapAggregateNode, Node } from "@core/Node";
import Payload from "@core/Payload";
import Schema from "@core/Schema";
import {
  getFrequencyHistogram,
  getGroupAverage,
  getGroupSum,
  rankPayloads,
} from "./operations/order";
import {
  getPayloadAverage,
  getPayloadCount,
  getPayloadSum,
} from "./operations/singular";

type AggregateProps = {
  operation:
    | "count"
    | "average"
    | "sum"
    | "rank"
    | "median"
    | "histogram_frequency"
    | "group_average"
    | "group_sum";
  target?: string;
  groupKey?: string;
};

type AggregateOperation = AggregateProps["operation"];
const singularOperation = ["count", "average", "sum"] as AggregateOperation[];

@MapAggregateNode(
  "Aggregate",
  "Perform aggregation operations on an array of data"
)
export default class Aggregate extends Node<AggregateProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    let value;
    let { operation, target, groupKey } = this.params;
    groupKey = groupKey ?? "contentType"
    target = target ?? "contentValue"

    if (singularOperation.indexOf(operation as AggregateOperation) != -1) {
      // Operations that emit exactly one payload
      switch (operation) {
        case "count":
          value = getPayloadCount(input, target);
          break

        case "sum":
          value = getPayloadSum(input, target);
          break

        case "average":
          value = getPayloadAverage(input, target);
          break
      }

      return [
        {
          contentType: operation,
          contentValue: value,
        },
      ];
    } else {
      // Operations that can emit more than one payload
      switch (operation) {
        case "rank":
          return rankPayloads(input, target);

        case "histogram_frequency":
          return getFrequencyHistogram(input, target);

        case "group_average":
          return getGroupAverage(input, target, groupKey);

        case "group_sum":
          return getGroupSum(input, target, groupKey);
      }
    }
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
      groupKey: {
        description:
          "Field with which to group payloads to perform aggregations on",
      },
    };
  }
}

/**
 * Returns a subsequence of `input` containing the `target` property
 */
export function getMatchingPayloads(
  input: Payload[],
  target: string = "contentValue"
) {
  return input.filter((payload) => payload.hasOwnProperty(target));
}

/**
 * Segregates payloads into different groups based on their value for the specified `groupKey`
 */
export function groupPayloads(
  input: Payload[],
  groupKey: string = "contentType"
): Record<string, Payload[]> {
  const matching = getMatchingPayloads(input, groupKey);
  const groups = {} as Record<string, Payload[]>;

  for (const payload of matching) {
    const targetValue = payload[groupKey];
    if (groups[targetValue] == null) {
      groups[targetValue] = [];
    }
    groups[targetValue].push(payload);
  }

  return groups;
}
