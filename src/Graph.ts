import { GraphLoader } from "./GraphLoader";
import Node from "./Node";

export interface NodeEdge {
  source: Node<unknown, unknown>;
  destination: Node<unknown, unknown>;
}

/**
 * A graph represents a set of nodes and their connections
 */
export default class Graph {
  private nodes: Record<string, Node<any, any>>;
  private edges: Record<string, NodeEdge[]>;

  constructor(public title: string) {
    this.nodes = {};
    this.edges = {};
  }

  /**
   * Add a node to the graph
   * @param name a unique name for the node
   * @param node the type of node to add
   *
   * @throws Error if a node named `name` already exists on the graph
   */
  public addNode<Schema, T>(name: string, node: Node<Schema, T>) {
    if (this.nodes[name] != null) {
      throw new Error(`A node named ${node} is already on this graph`);
    }
    this.nodes[name] = node;
    this.edges[name] = [];
  }

  /**
   * Connect two nodes in the graph.
   * @param srcName the source node
   * @param dstName the destination node
   *
   * @throws an error if either `source` or `destination` are not on the graph.
   */
  public connectNodes(srcName: string, dstName: string) {
    const source = this.nodes[srcName];
    const destination = this.nodes[srcName];
    if (source == null) {
      throw new Error(
        `Node ${srcName} does not exist on the graph. Add it first!`
      );
    }
    if (destination == null) {
      throw new Error(
        `Node ${dstName} does not exist on the graph. Add it first!`
      );
    }
    this.edges[srcName].push({ source, destination });
  }

  /**
   * Load a graph from a string
   */
  public static fromString(graphString: string): Graph {
    return GraphLoader.fromString(graphString);
  }

  /**
   * Return a string representation of this graph
   */
  public toString(): String {
    return this.title;
  }
}
