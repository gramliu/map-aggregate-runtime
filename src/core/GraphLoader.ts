import { nodes } from "../config.json";
import Graph from "./Graph";
import { getRegisteredNode } from "./MapAggregateNode";
import Node, { NodeProps } from "./Node";
import ParseError from "./ParseError";
import type { ScalarType } from "./Payload";

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
   * @throws an error if an expected component was not found or
   * an error otherwise occured while parsing
   */
  public static parse(graphString: string): Graph {
    this.loadNodes();
    try {
      const tags = ["TITLE", "PIPELINE", "PARAMETER", "HARDWARE"];
      const lines = graphString.split("\n");

      const title = this.getFirstWithTag(lines, "TITLE");
      const hardware = this.getFirstWithTag(lines, "HARDWARE").toString();
      const pipeline = this.getFirstWithTag(lines, "PIPELINE")
        .split("->")
        .map((node) => node.trim());
      const parameterLines = this.getAllWithTag(lines, "PARAMETER");
      const parameters = this.parseParameters(parameterLines);

      // Parse and instantiate the nodes
      const nodes = this.parseNodes(lines, tags);

      // Construct the graph
      const graph = new Graph(title);
      graph.addHardware(hardware);

      // Add nodes
      const mapNodeRegex = /\[[a-zA-Z0-9_]+\]/;
      for (const nodeName of pipeline) {
        if (mapNodeRegex.test(nodeName)) {
          // TODO: Support map nodes on graphs
          // Map node. Ignore for now
          continue;
        }
        const node = nodes[nodeName];
        graph.addNode(nodeName, node);
      }

      // Add runtime parameters to nodes
      for (const [node, property] of parameters) {
        graph.addParameter(node, property);
      }

      return graph;
    } catch (err) {
      throw new ParseError("Unable to parse graph!", err);
    }
  }

  /**
   * Load nodes registered in package.json
   */
  public static loadNodes() {
    for (const node of nodes) {
      require("../" + node);
    }
  }

  /**
   * Parse runtime parameters for the graph
   */
  private static parseParameters(parameterLines: string[]): [string, string][] {
    const inputs = [] as [string, string][];
    for (const line of parameterLines) {
      const tokens = line.split(".");
      if (tokens.length < 2) {
        throw new ParseError(`Malformed graph parameter: ${line}`);
      }
      const [node, property] = tokens;
      inputs.push([node, property]);
    }
    return inputs;
  }

  /**
   * Parse nodes in the specified manifest.
   * `otherTags` is a list of tags that indicate other lines to remove
   */
  private static parseNodes(
    lines: string[],
    otherTags: string[]
  ): Record<string, Node<NodeProps>> {
    // Filter out irrelevant lines
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

    const nodes: Record<string, Node<NodeProps>> = {};
    // Parse nodes while any are present
    while (this.hasNode(declarations)) {
      const { startIndex, endIndex, node, name } = this.parseNode(declarations);
      declarations =
        declarations.substring(0, startIndex) +
        declarations.substring(endIndex + 1);
      nodes[name] = node;
    }
    return nodes;
  }

  /**
   * Returns true if there are still nodes available for parsing in the specified manifest
   */
  private static hasNode(manifest: string): boolean {
    // Empty string cannot contain node
    if (manifest.length == 0) {
      return false;
    }

    // Node declaration must contain an open/close parenthesis
    return !(manifest.indexOf("(") == -1 || manifest.indexOf(")") == -1);
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
      const params = this.parseParams(`{${paramsLine}}`);
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
  private static parseParams(paramsStr: string): Record<string, ScalarType> {
    // Surround unescaped keys with quotation marks
    const regex = new RegExp(/([a-zA-Z][a-zA-Z0-9_]+:)/g);
    const escaped = paramsStr.replace(
      regex,
      (property: string) => `"${property.slice(0, property.length - 1)}":`
    );

    const params = JSON.parse(escaped) as Record<string, ScalarType>;
    if (params["type"] == null) {
      throw new ParseError(
        "Missing required 'type' in params: " + JSON.stringify(params)
      );
    }
    return params;
  }

  /**
   * Get the first value labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  private static getFirstWithTag(lines: string[], tag: string): string {
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
  private static getAllWithTag(lines: string[], tag: string): string[] {
    const matching = lines.filter((line) => line.startsWith(tag));
    const values = matching.map((line) =>
      line.substring(tag.length + 1).trim()
    );
    return values;
  }
}
