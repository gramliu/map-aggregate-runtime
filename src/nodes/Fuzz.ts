import Payload from "../core/Payload";
import Schema from "../core/Schema";
import getMatchingPayloads from "../util/getMatchingPayloads";
import MapAggregateNode from "../core/MapAggregateNode";
import Node from "../core/Node";

type RangeType = "linear" | "logarithmic" | "halfLogarithmic";

export type FuzzProps = {
  fuzzType: "likert" | "range" | "percent";
  target: string;
  likertMean?: number;
  likertStdDev?: number;
  rangeType?: RangeType;
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
    const { fuzzType, target, rangeType } =
      this.getLocalParams(params);
    const matching = getMatchingPayloads(input, target);
    switch (fuzzType) {
      case "range":
        return fuzzPayloadsIntoRange(matching, target, rangeType);

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
      rangeType: {
        description: "The type of range to apply, e.g. linear, logarithmic, halfLogarithmic",
        defaultValue: "logarithmic"
      }
    };
  }
}

/**
 * Fuzz payload values into bins of size `rangeStart`
 */
function fuzzPayloadsIntoRange(
  input: Payload[],
  target: string,
  rangeType: RangeType
): Payload[] {
  const output = [];
  for (const payload of input) {
    const value = payload[target];

    if (typeof value !== "number") {
      throw new Error("Can only perform range fuzz on numeric values!");
    }

    let binLo = 0;
    let binHi = 0;

    switch (rangeType) {
      case "logarithmic":
        [binLo, binHi] = computeLogarithmicBin(value);
        break;

      case "halfLogarithmic":
        [binLo, binHi] = computeLogarithmicBin(value, true)
    }

    output.push({
      ...payload,
      [`${target}`]: `${binLo}-${binHi}`,
    });
  }

  return output;
}

/**
 * Compute low and high logarithmic bins for a value
 */
function computeLogarithmicBin(value: number, splitHalf: boolean = false): [number, number] {
  const abs = Math.abs(value);
  const sign = value == 0 ? 1 : Math.sign(value);

  const loPow = value == 0 ? 0 : Math.floor(Math.log10(abs));
  let lo = Math.pow(10, loPow) * sign
  let hi = Math.pow(10, loPow + 1) * sign

  if (lo > hi) {
    [lo, hi] = [hi, lo]
  }

  // Include midpoints i.e. [10, 100] -> [10, 50] or [50, 100]
  if (splitHalf) {
    const mid = lo * 5;
    if (value < mid) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return [lo, hi]
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
