"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
exports.__esModule = true;
var GraphLoader_1 = require("./GraphLoader");
/**
 * A graph represents a set of nodes and their connections
 */
var Graph = /** @class */ (function () {
  function Graph(title) {
    this.title = title;
    this.pipeline = [];
    this.nodeRegistry = {};
  }
  /**
   * Run the graph with the input, if specified
   */
  Graph.prototype.execute = function (input, debug) {
    if (input === void 0) {
      input = [];
    }
    if (debug === void 0) {
      debug = false;
    }
    return __awaiter(this, void 0, void 0, function () {
      var payloads, _i, _a, nodeName, node;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            payloads = input;
            (_i = 0), (_a = this.pipeline);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            nodeName = _a[_i];
            node = this.nodeRegistry[nodeName];
            if (debug) {
              console.log(
                "Running node: "
                  .concat(nodeName, " (")
                  .concat(node.getType(), ")")
              );
              console.log("Input:", payloads);
            }
            return [4 /*yield*/, node.process(payloads)];
          case 2:
            payloads = _b.sent();
            if (debug) {
              console.log("Output:", payloads);
              console.log("=====");
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, payloads];
        }
      });
    });
  };
  /**
   * Add a node to the graph
   * @param name a unique name for the node
   * @param node the type of node to add
   *
   * @throws Error if a node named `name` already exists on the graph
   */
  Graph.prototype.addNode = function (name, node) {
    if (node == null) {
      throw new Error("Cannot add a null node to the graph!");
    }
    if (this.nodeRegistry[name] != null) {
      throw new Error(
        "A node named ".concat(node, " is already on this graph")
      );
    }
    this.nodeRegistry[name] = node;
    this.pipeline.push(name);
  };
  /**
   * Load a graph from a string
   */
  Graph.fromString = function (graphString) {
    return GraphLoader_1["default"].parse(graphString);
  };
  /**
   * Return a string representation of this graph
   */
  Graph.prototype.toString = function () {
    var pipelineStr = this.pipeline.join(" -> ");
    return 'Graph{title: "'
      .concat(this.title, '", pipeline: "')
      .concat(pipelineStr, '", nodes: "')
      .concat(this.nodeRegistry, '"}');
  };
  return Graph;
})();
exports["default"] = Graph;
