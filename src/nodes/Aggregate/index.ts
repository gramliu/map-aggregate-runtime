import MapAggregateNode from "../../core/MapAggregateNode";
import Node from "../../core/Node";
import Payload from "../../core/Payload";
import Schema from "../../core/Schema";
import getMatchingPayloads from "../../util/getMatchingPayloads";
import {
  getFrequencyHistogram,
  getGroupAverage,
  getGroupSum,
} from "./operations/order";
import {
  getPayloadAverage,
  getPayloadCount,
  getPayloadSum,
} from "./operations/singular";
import getContentType from "../../util/getContentType";

export type AggregateProps = {
  operation:
    | "count"
    | "average"
    | "sum"
    | "rank"
    | "histogramFrequency"
    | "groupAverage"
    | "groupSum";
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
  async process(
    input: Payload[],
    params?: Partial<AggregateProps>
  ): Promise<Payload[]> {
    let { operation, target, groupKey } = this.getLocalParams(params);
    const contentType = getContentType(input, operation)
    let value;

    if (singularOperation.indexOf(operation as AggregateOperation) != -1) {
      // Operations that emit exactly one payload
      switch (operation) {
        case "count":
          value = getPayloadCount(input, target);
          break;

        case "sum":
          value = getPayloadSum(input, target);
          break;

        case "average":
          value = getPayloadAverage(input, target);
          break;
      }

      return [
        {
          contentType,
          contentValue: value,
          operationId: operation,
        },
      ];
    } else {
      // Operations that can emit more than one payload
      switch (operation) {
        case "histogramFrequency":
          return getFrequencyHistogram(input, target);

        case "groupAverage":
          return getGroupAverage(input, target, groupKey);

        case "groupSum":
          return getGroupSum(input, target, groupKey);
      }
    }
  }

  getSchema(): Schema<Required<AggregateProps>> {
    return {
      target: {
        description: "The target field on each payload to aggregate from",
        defaultValue: "contentValue",
      },
      operation: {
        description: "The aggregation operation to perform",
        defaultValue: "count",
      },
      groupKey: {
        description:
          "Field with which to group payloads to perform aggregations on",
        defaultValue: "contentType",
      },
    };
  }
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
