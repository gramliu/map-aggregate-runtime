import Payload from "../core/Payload";

/**
 * Returns a subsequence of `input` containing the `target` property
 */
export default function getMatchingPayloads(
  input: Payload[],
  target: string = "contentValue"
) {
  return input.filter((payload) => payload.hasOwnProperty(target));
}
