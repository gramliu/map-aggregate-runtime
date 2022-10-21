import Payload from "../core/Payload";
import Schema from "../core/Schema";
import getMatchingPayloads from "../util/getMatchingPayloads";
import MapAggregateNode from "../core/MapAggregateNode";
import Node from "../core/Node";

export type FuzzProps = {
  fuzzType: "likert" | "range" | "percent";
  target: string;
  likertMean?: number;
  likertStdDev?: number;
  rangeStart?: number;
  rangeSize?: number;
};

@MapAggregateNode(
  "Fuzz",
  "Convert a fine-grained number into a format with coarser granularity"
)
export default class Fuzz extends Node<FuzzProps> {
  async process(
    input: Payload[],
    params?: Partial<FuzzProps>
  ): Promise<Payload[]> {
    const { fuzzType, target, rangeStart, rangeSize } =
      this.getLocalParams(params);
    const matching = getMatchingPayloads(input, target);
    switch (fuzzType) {
      case "range":
        return fuzzPayloadsIntoRange(matching, target, rangeStart, rangeSize);

      case "percent":
        return fuzzPayloadsIntoPercent(matching, target);
    }
  }

  getSchema(): Schema<Required<FuzzProps>> {
    return {
      fuzzType: {
        description: "The type of fuzz operation to perform",
      },
      target: {
        description: "The target property on payloads to fuzz",
        defaultValue: "contentValue",
      },
      likertMean: {
        description: "Mean to be used in likert scaling",
      },
      likertStdDev: {
        description: "Standard deviation to be used in likert scaling",
      },
      rangeStart: {
        description: "Initial value for the bins",
      },
      rangeSize: {
        description: "Size of each bin",
      },
    };
  }
}

/**
 * Fuzz payload values into bins of size `rangeStart`
 */
function fuzzPayloadsIntoRange(
  input: Payload[],
  target: string,
  rangeStart: number,
  rangeSize: number
): Payload[] {
  const output = [];
  for (const payload of input) {
    const value = payload[target];

    if (typeof value !== "number") {
      throw new Error("Can only perform range fuzz on numeric values!");
    }

    const binLo =
      Math.floor((value - rangeStart) / rangeSize) * rangeSize + rangeStart;
    const binHi = binLo + rangeSize - 1;
    output.push({
      ...payload,
      [`${target}`]: `${binLo}-${binHi}`,
    });
  }

  return output;
}

/**
 * Fuzz payload values into percentages of the maximum encountered value
 */
function fuzzPayloadsIntoPercent(input: Payload[], target: string): Payload[] {
  const output = [];
  const payloadMax = input.reduce((max, payload) =>
    payload.contentValue > max.contentValue ? payload : max
  ).contentValue as number;
  if (typeof payloadMax !== "number") {
    throw new Error("Can only perform percent fuzz on numeric values!");
  }
  for (const payload of input) {
    const value = payload[target];
    output.push({
      ...payload,
      [`${target}`]: (value * 100) / payloadMax,
    });
  }
  return output;
}
