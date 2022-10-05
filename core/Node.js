"use strict";
exports.__esModule = true;
exports.Node = exports.MapAggregateNode = exports.getRegisteredNode = void 0;
var nodeRegistry = {};
/**
 * Get a node by its name
 */
function getRegisteredNode(name) {
  return nodeRegistry[name];
}
exports.getRegisteredNode = getRegisteredNode;
/**
 * Decorator to register a Map-Aggregate node
 * @param name Name of the node
 * @param description Description of the node
 */
function MapAggregateNode(name, description) {
  return function (constructor) {
    nodeRegistry[name] = {
      name: name,
      description: description,
      constructor: constructor,
    };
    constructor.prototype.name = name;
    constructor.prototype.description = description;
  };
}
exports.MapAggregateNode = MapAggregateNode;
/**
 * A node represents a single function in a map-aggregate manifest
 */
var Node = /** @class */ (function () {
  function Node(params) {
    this.params = params;
    var entries = Object.entries(params);
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
      var _a = entries_1[_i],
        key = _a[0],
        val = _a[1];
      if (val == null) {
        this.params[key] = this.getSchema()[key].defaultValue;
      }
    }
  }
  /**
   * Return a string representation of this node
   */
  Node.prototype.toString = function () {
    var nodeType = Object.getPrototypeOf(this).name;
    return 'Node{type: "'
      .concat(nodeType, '", params: ')
      .concat(this.params, "}");
  };
  /**
   * Returns the type of this node, if it was registered
   * with the @MapAggregateNode annotation
   */
  Node.prototype.getType = function () {
    var nodeType = Object.getPrototypeOf(this).name;
    return nodeType;
  };
  /**
   * Returns the descriptions for this node type, if it was registered
   * with the @MapAggregateNode annotation
   */
  Node.prototype.getDescription = function () {
    var description = Object.getPrototypeOf(this).description;
    return description;
  };
  return Node;
})();
exports.Node = Node;
