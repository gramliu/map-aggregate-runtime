"use strict";
exports.__esModule = true;
/**
 * Returns a subsequence of `input` containing the `target` property
 */
function getMatchingPayloads(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  return input.filter(function (payload) {
    return payload.hasOwnProperty(target);
  });
}
exports["default"] = getMatchingPayloads;
