"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
exports.__esModule = true;
exports.getGroupAverage =
  exports.getGroupSum =
  exports.getFrequencyHistogram =
  exports.getMedian =
  exports.rankPayloads =
    void 0;
var Aggregate_1 = require("@nodes/Aggregate");
var singular_1 = require("./singular");
var getMatchingPayloads_1 = require("@util/getMatchingPayloads");
/**
 * Sorts the payloads based on the `target` field
 */
function rankPayloads(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  var matching = (0, getMatchingPayloads_1["default"])(input, target);
  return __spreadArray([], matching, true).sort(function (payload) {
    return payload[target];
  });
}
exports.rankPayloads = rankPayloads;
/**
 * Returns the median payload from the input.
 * @throws Error if there are no matching payloads
 */
function getMedian(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  var sorted = rankPayloads(input, target);
  if (sorted.length == 0) {
    throw new Error("No matching payloads for median!");
  }
  return input[sorted.length / 2];
}
exports.getMedian = getMedian;
/**
 * Returns a mapping of unique values for the `target` property
 *  to the number of times they occur across the payloads
 */
function getFrequencyHistogram(input, target) {
  if (target === void 0) {
    target = "contentValue";
  }
  var groups = (0, Aggregate_1.groupPayloads)(input, target);
  var frequencies = Object.entries(groups).map(function (_a) {
    var targetValue = _a[0],
      payloads = _a[1];
    return {
      contentType: "frequency ".concat(targetValue),
      contentValue: payloads.length,
    };
  });
  return frequencies;
}
exports.getFrequencyHistogram = getFrequencyHistogram;
/**
 * Returns a mapping of unique values for the `groupKey` property
 * to the sum of the values of `target` across the payloads
 */
function getGroupSum(input, target, groupKey) {
  if (target === void 0) {
    target = "contentValue";
  }
  if (groupKey === void 0) {
    groupKey = "contentType";
  }
  var matching = (0, getMatchingPayloads_1["default"])(input, target);
  var groups = (0, Aggregate_1.groupPayloads)(matching, groupKey);
  var sums = Object.entries(groups).map(function (_a) {
    var groupKey = _a[0],
      payloads = _a[1];
    return {
      contentType: "group sum ".concat(groupKey),
      contentValue: (0, singular_1.getPayloadSum)(payloads, target),
    };
  });
  return sums;
}
exports.getGroupSum = getGroupSum;
/**
 * Returns a mapping of unique values for the `groupKey` property
 * to the average of the values of `target` across the payloads
 */
function getGroupAverage(input, target, groupKey) {
  if (target === void 0) {
    target = "contentValue";
  }
  if (groupKey === void 0) {
    groupKey = "contentType";
  }
  var matching = (0, getMatchingPayloads_1["default"])(input, target);
  var groups = (0, Aggregate_1.groupPayloads)(matching, groupKey);
  var averages = Object.entries(groups).map(function (_a) {
    var groupKey = _a[0],
      payloads = _a[1];
    return {
      contentType: "group average ".concat(groupKey),
      contentValue:
        (0, singular_1.getPayloadSum)(payloads, target) / payloads.length,
    };
  });
  return averages;
}
exports.getGroupAverage = getGroupAverage;
