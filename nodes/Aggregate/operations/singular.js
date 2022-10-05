"use strict";
exports.__esModule = true;
exports.getPayloadAverage =
  exports.getPayloadSum =
  exports.getPayloadCount =
    void 0;
var getMatchingPayloads_1 = require("@util/getMatchingPayloads");
/**
 * Returns the number of payloads that contain the `target` property
 * If target is unspecified, it simply returns the number of payloads
 */
function getPayloadCount(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  return (0, getMatchingPayloads_1["default"])(input, target).length;
}
exports.getPayloadCount = getPayloadCount;
/**
 * Sums numeric values associated with the field `target`
 */
function getPayloadSum(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  return input.reduce(function (acc, payload) {
    var _a, _b;
    var targetVal = (_a = payload[target]) !== null && _a !== void 0 ? _a : 0;
    if (typeof targetVal !== "number") {
      throw new TypeError(
        "Numeric value required for aggregate operation: sum. \n          Encountered type: '".concat(
          typeof targetVal,
          "'"
        )
      );
    }
    return acc + ((_b = payload[target]) !== null && _b !== void 0 ? _b : 0);
  }, 0);
}
exports.getPayloadSum = getPayloadSum;
/**
 * Gets the sum divided by the count of payloads matching `target`
 * @throws Error if there are 0 matching payloads
 */
function getPayloadAverage(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  var sum = getPayloadSum(input, target);
  var count = getPayloadCount(input, target);
  if (count == 0) {
    throw new Error("Cannot get average over 0 payloads!");
  }
  return sum / count;
}
exports.getPayloadAverage = getPayloadAverage;
