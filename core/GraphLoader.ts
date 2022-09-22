import Graph from "./Graph";
import { getRegisteredNode, Node, NodeProps } from "./Node";
import ParseError from "./ParseError";
import { ScalarType } from "./Payload";
import { mapAggregate } from "../package.json";

interface NodeParseResult {
  name: string;
  node: Node<NodeProps>;
  startIndex: number;
  endIndex: number;
}

/**
 * Utility class for loading graphs from different sources
 */
export default class GraphLoader {
  /**
   * Generate a graph from a string
   *
   * @throws an error if an expected component was not found
   */
  public static parse(graphString: string): Graph {
    this.loadNodes();
    try {
      const lines = graphString.split("\n");
      const title = this.getFirstWithTag(lines, "TITLE");
      const pipeline = this.getFirstWithTag(lines, "PIPELINE")
        .split("->")
        .map((node) => node.trim());
      const inputs = this.getAllWithTag(lines, "INPUT");

      const otherTags = ["TITLE", "PIPELINE", "INPUT"];

      let declarations = lines
        .filter((line) => {
          for (const other of otherTags) {
            if (line.startsWith(other) || line.length == 0) {
              return false;
            }
          }
          return true;
        })
        .join("\n")
        .trim();

      // Parse and instantiate the nodes
      const nodes: Record<string, Node<NodeProps>> = {};
      while (this.hasNode(declarations)) {
        const { startIndex, endIndex, node, name } =
          this.parseNode(declarations);
        declarations =
          declarations.substring(0, startIndex) +
          declarations.substring(endIndex + 1);
        nodes[name] = node;
      }

      // Construct the graph
      const graph = new Graph(title);
      for (const nodeName of pipeline) {
        const node = nodes[nodeName];
        graph.addNode(nodeName, node);
      }

      return graph;
    } catch (err) {
      throw new ParseError("Unable to parse graph!", err);
    }
  }

  /**
   * Load nodes
   */
  private static loadNodes() {
    const { nodes } = mapAggregate ?? { nodes: [] };
    for (const node of nodes) {
      require("../" + node);
    }
  }

  private static hasNode(manifest: string): boolean {
    // Empty string cannot contain node
    if (manifest.length == 0) {
      return false;
    }

    // Node declaration must contain an open/close parenthesis
    if (manifest.indexOf("(") == -1 || manifest.indexOf(")") == -1) {
      return false;
    }

    return true;
  }

  /**
   * Parse a node from the manifest.
   * At this point, there should be nothing else in the manifest
   * aside from node declarations
   */
  private static parseNode(manifest: string): NodeParseResult {
    // Identify declaration substring
    const openIdx = manifest.indexOf("(");
    const closeIdx = manifest.indexOf(")");
    const declaration = manifest.substring(0, closeIdx + 1);
    try {
      // Extract relevant fields
      const name = declaration.substring(0, openIdx).trim();
      const paramsLine = declaration.substring(openIdx + 1, closeIdx);
      const params = this.parseParams(paramsLine);
      const nodeType = params["type"].toString();

      // Instantiate node
      const registered = getRegisteredNode(nodeType);
      const node = new registered.constructor(params);
      return {
        name,
        node,
        startIndex: 0,
        endIndex: closeIdx,
      };
    } catch (err) {
      throw new ParseError("Could not parse node: " + declaration, err);
    }
  }

  /**
   * Parse the parameters to a node
   */
  private static parseParams(line: string): Record<string, ScalarType> {
    const commaRegex = /(?!\B"[^"]*),(?![^"]*"\B)/g;
    const colonRegex = /(?!\B"[^"]*):(?![^"]*"\B)/g;

    const params: Record<string, ScalarType> = {};
    try {
      // Identify comma breakpoints
      const breakpoints = [];
      let commaMatch;
      while ((commaMatch = commaRegex.exec(line)) !== null) {
        commaRegex.lastIndex++;
        breakpoints.push(commaMatch.index);
      }

      // Split param string into segments using breakpoints
      const breakpointCount = breakpoints.length;
      const segments = [];
      for (let i = 0; i <= breakpointCount; i++) {
        const start = i == 0 ? -1 : breakpoints[i - 1];
        const end = i == breakpointCount ? line.length : breakpoints[i];
        const param = line.substring(start + 1, end).trim();
        if (param.indexOf(":") != -1) {
          segments.push(param);
        }
      }

      // Parse segments into param-value entries
      for (const segment of segments) {
        const colonMatch = colonRegex.exec(segment);
        if (colonMatch === null) {
          // Missing colon in param
          continue;
        }

        const colonMatchIdx = colonMatch.index;
        const paramName = segment.substring(0, colonMatchIdx);
        const paramValueRaw = segment.substring(colonMatchIdx + 1).trim();
        const paramValue = this.parseValue(paramValueRaw);

        params[paramName] = paramValue;
      }
    } catch (err) {
      throw new ParseError("Could not parse param: " + line, err);
    }

    if (params["type"] == null) {
      throw new ParseError("Missing type in params: " + JSON.stringify(params));
    }

    return params;
  }

  /**
   * Parse a string-representation of a value into its runtime equivalent
   */
  private static parseValue(value: string): ScalarType {
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
  }

  /**
   * Get the first value labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  private static getFirstWithTag(lines: string[], tag: string) {
    tag += ": ";
    const line = lines.find((line) => line.startsWith(tag));
    if (line == null) {
      throw new Error(`Line with tag "${tag}" was not found!`);
    }
    const value = line.substring(tag.length);
    return value;
  }

  /**
   * Get all values labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  private static getAllWithTag(lines: string[], tag: string) {
    const matching = lines.filter((line) => line.startsWith(tag));
    const values = matching.map((line) =>
      line.substring(tag.length + 1).trim()
    );
    return values;
  }
}
