import Payload from "@core/Payload";
import { getMatchingPayloads } from "..";

/**
 * Returns the number of payloads that contain the `target` property
 * If target is unspecified, it simply returns the number of payloads
 */
export function getPayloadCount(
  input: Payload[],
  target: string = "contentValue"
): number {
  return getMatchingPayloads(input, target).length;
}

/**
 * Sums numeric values associated with the field `target`
 */
export function getPayloadSum(
  input: Payload[],
  target: string = "contentValue"
): number {
  const sum = input.reduce((acc, payload) => {
    const targetVal = payload[target] ?? 0;
    if (typeof targetVal !== "number") {
      throw new TypeError(
        `Numeric value required for aggregate operation: sum. 
          Encountered type: '${typeof targetVal}'`
      );
    }
    return acc + (payload[target] ?? 0);
  }, 0);
  return sum;
}

/**
 * Gets the sum divided by the count of payloads matching `target`
 * @throws Error if there are 0 matching payloads
 */
export function getPayloadAverage(
  input: Payload[],
  target: string = "contentValue"
): number {
  const sum = getPayloadSum(input, target);
  const count = getPayloadCount(input, target);
  if (count == 0) {
    throw new Error("Cannot get average over 0 payloads!");
  }
  return sum / count;
}
