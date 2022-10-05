"use strict";
exports.__esModule = true;
var Graph_1 = require("./Graph");
var Node_1 = require("./Node");
var ParseError_1 = require("./ParseError");
var config_json_1 = require("../config.json");
/**
 * Utility class for loading graphs from different sources
 */
var GraphLoader = /** @class */ (function () {
  function GraphLoader() {}
  /**
   * Generate a graph from a string
   *
   * @throws an error if an expected component was not found
   */
  GraphLoader.parse = function (graphString) {
    this.loadNodes();
    try {
      var lines = graphString.split("\n");
      var title = this.getFirstWithTag(lines, "TITLE");
      var pipeline = this.getFirstWithTag(lines, "PIPELINE")
        .split("->")
        .map(function (node) {
          return node.trim();
        });
      var inputs = this.getAllWithTag(lines, "INPUT");
      var otherTags_1 = ["TITLE", "PIPELINE", "INPUT"];
      var declarations = lines
        .filter(function (line) {
          for (
            var _i = 0, otherTags_2 = otherTags_1;
            _i < otherTags_2.length;
            _i++
          ) {
            var other = otherTags_2[_i];
            if (line.startsWith(other) || line.length == 0) {
              return false;
            }
          }
          return true;
        })
        .join("\n")
        .trim();
      // Parse and instantiate the nodes
      // TODO: Can we use the JS/TS parser to parse nodes?
      var nodes_1 = {};
      while (this.hasNode(declarations)) {
        var _a = this.parseNode(declarations),
          startIndex = _a.startIndex,
          endIndex = _a.endIndex,
          node = _a.node,
          name_1 = _a.name;
        declarations =
          declarations.substring(0, startIndex) +
          declarations.substring(endIndex + 1);
        nodes_1[name_1] = node;
      }
      // Construct the graph
      var graph = new Graph_1["default"](title);
      for (var _i = 0, pipeline_1 = pipeline; _i < pipeline_1.length; _i++) {
        var nodeName = pipeline_1[_i];
        var node = nodes_1[nodeName];
        graph.addNode(nodeName, node);
      }
      return graph;
    } catch (err) {
      throw new ParseError_1["default"]("Unable to parse graph!", err);
    }
  };
  /**
   * Load nodes registered in package.json
   */
  GraphLoader.loadNodes = function () {
    for (var _i = 0, nodes_2 = config_json_1.nodes; _i < nodes_2.length; _i++) {
      var node = nodes_2[_i];
      require("../" + node);
    }
  };
  GraphLoader.hasNode = function (manifest) {
    // Empty string cannot contain node
    if (manifest.length == 0) {
      return false;
    }
    // Node declaration must contain an open/close parenthesis
    return !(manifest.indexOf("(") == -1 || manifest.indexOf(")") == -1);
  };
  /**
   * Parse a node from the manifest.
   * At this point, there should be nothing else in the manifest
   * aside from node declarations
   */
  GraphLoader.parseNode = function (manifest) {
    // Identify declaration substring
    var openIdx = manifest.indexOf("(");
    var closeIdx = manifest.indexOf(")");
    var declaration = manifest.substring(0, closeIdx + 1);
    try {
      // Extract relevant fields
      var name_2 = declaration.substring(0, openIdx).trim();
      var paramsLine = declaration.substring(openIdx + 1, closeIdx);
      var params = this.parseParams(paramsLine);
      var nodeType = params["type"].toString();
      // Instantiate node
      var registered = (0, Node_1.getRegisteredNode)(nodeType);
      var node = new registered.constructor(params);
      return {
        name: name_2,
        node: node,
        startIndex: 0,
        endIndex: closeIdx,
      };
    } catch (err) {
      throw new ParseError_1["default"](
        "Could not parse node: " + declaration,
        err
      );
    }
  };
  /**
   * Parse the parameters to a node
   */
  GraphLoader.parseParams = function (line) {
    var commaRegex = /(?!\B"[^"]*),(?![^"]*"\B)/g;
    var colonRegex = /(?!\B"[^"]*):(?![^"]*"\B)/g;
    var params = {};
    try {
      // Identify comma breakpoints
      var breakpoints = [];
      var commaMatch = void 0;
      while ((commaMatch = commaRegex.exec(line)) !== null) {
        commaRegex.lastIndex++;
        breakpoints.push(commaMatch.index);
      }
      // Split param string into segments using breakpoints
      var breakpointCount = breakpoints.length;
      var segments = [];
      for (var i = 0; i <= breakpointCount; i++) {
        var start = i == 0 ? -1 : breakpoints[i - 1];
        var end = i == breakpointCount ? line.length : breakpoints[i];
        var param = line.substring(start + 1, end).trim();
        if (param.indexOf(":") != -1) {
          segments.push(param);
        }
      }
      // Parse segments into param-value entries
      for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
        var segment = segments_1[_i];
        var colonMatch = colonRegex.exec(segment);
        if (colonMatch === null) {
          // Missing colon in param
          continue;
        }
        var colonMatchIdx = colonMatch.index;
        var paramName = segment.substring(0, colonMatchIdx);
        var paramValueRaw = segment.substring(colonMatchIdx + 1).trim();
        var paramValue = this.parseValue(paramValueRaw);
        params[paramName] = paramValue;
      }
    } catch (err) {
      throw new ParseError_1["default"]("Could not parse param: " + line, err);
    }
    if (params["type"] == null) {
      throw new ParseError_1["default"](
        "Missing type in params: " + JSON.stringify(params)
      );
    }
    return params;
  };
  /**
   * Parse a string-representation of a value into its runtime equivalent
   */
  GraphLoader.parseValue = function (value) {
    if (value.startsWith('"') && value.endsWith('"')) {
      // String type
      return value.substring(1, value.length - 1);
    } else if (value == "true" || value == "false") {
      // Boolean type
      return value == "true";
    } else if (value.indexOf(".") == -1) {
      // Integer type
      return parseInt(value);
    } else {
      // Float type
      return parseFloat(value);
    }
  };
  /**
   * Get the first value labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  GraphLoader.getFirstWithTag = function (lines, tag) {
    tag += ": ";
    var line = lines.find(function (line) {
      return line.startsWith(tag);
    });
    if (line == null) {
      throw new Error('Line with tag "'.concat(tag, '" was not found!'));
    }
    var value = line.substring(tag.length);
    return value;
  };
  /**
   * Get all values labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  GraphLoader.getAllWithTag = function (lines, tag) {
    var matching = lines.filter(function (line) {
      return line.startsWith(tag);
    });
    var values = matching.map(function (line) {
      return line.substring(tag.length + 1).trim();
    });
    return values;
  };
  return GraphLoader;
})();
exports["default"] = GraphLoader;
