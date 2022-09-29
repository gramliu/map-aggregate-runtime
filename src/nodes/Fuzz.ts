import { MapAggregateNode, Node } from "@core/Node";
import Payload from "@core/Payload";
import Schema from "@core/Schema";
import getMatchingPayloads from "./util/getMatchingPayloads";

type FuzzProps = {
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
  async process(input: Payload[]): Promise<Payload[]> {
    const target = this.params.target;
    const matching = getMatchingPayloads(input, target);
    return [...matching].sort((payloadA, payloadB) =>
      payloadA[target] > payloadB[target] ? 1 : -1
    );
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
 * Fuzz payloads into bins of size `rangeStart`
 */
function fuzzPayloadsIntoRange(
  input: Payload[],
  target: string,
  rangeStart: number,
  rangeSize: number
): Payload[] {
  const matching = getMatchingPayloads(input, target);
  const output = []

  for (const payload of matching) {
    const value = payload[this.params.target];

    const binLo = Math.floor((value - rangeStart) / rangeSize) * rangeSize + rangeStart;
    const binHi = binLo + rangeSize - 1;
    output.push({
      ...payload,
      [`${target}`]: `${binLo}-${binHi}`
    })
  }

  return output
}
