import Payload from "../../../core/Payload";
import { groupPayloads } from "../index";
import { getPayloadSum } from "./singular";
import getMatchingPayloads from "../../../util/getMatchingPayloads";
import getContentType from "../../../util/getContentType";

/**
 * Returns a mapping of unique values for the `target` property
 *  to the number of times they occur across the payloads
 */
export function getFrequencyHistogram(
  input: Payload[],
  target: string = "contentValue"
): Payload[] {
  const contentType = getContentType(input, "frequency");
  const groups = groupPayloads(input, target);
  const frequencies = Object.entries(groups).map(([groupKey, payloads]) => ({
    contentType,
    contentValue: payloads.length,
    operationId: "frequency-histogram",
    groupId: groupKey,
  }));
  frequencies.sort((a, b) => b.contentValue - a.contentValue)
  return frequencies;
}

/**
 * Returns a mapping of unique values for the `groupKey` property
 * to the sum of the values of `target` across the payloads
 */
export function getGroupSum(
  input: Payload[],
  target: string = "contentValue",
  groupKey: string = "contentType"
): Payload[] {
  const matching = getMatchingPayloads(input, target);
  const contentType = getContentType(matching, "group sum")
  const groups = groupPayloads(matching, groupKey);
  const sums = Object.entries(groups).map(([groupKey, payloads]) => ({
    contentType,
    contentValue: getPayloadSum(payloads, target),
    operationId: "group-sum",
    groupId: groupKey,
  }));
  sums.sort((a, b) => b.contentValue - a.contentValue)
  return sums;
}

/**
 * Returns a mapping of unique values for the `groupKey` property
 * to the average of the values of `target` across the payloads
 */
export function getGroupAverage(
  input: Payload[],
  target: string = "contentValue",
  groupKey: string = "contentType"
): Payload[] {
  const matching = getMatchingPayloads(input, target);
  const contentType = getContentType(matching, "group average")
  const groups = groupPayloads(matching, groupKey);
  const averages = Object.entries(groups).map(([groupKey, payloads]) => ({
    contentType,
    contentValue: getPayloadSum(payloads, target) / payloads.length,
    operationId: "group-average",
    groupId: groupKey,
  }));
  averages.sort((a, b) => b.contentValue - a.contentValue);
  return averages;
}
