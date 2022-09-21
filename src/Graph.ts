import GraphLoader from "./GraphLoader";
import type { Node, NodeProps } from "./Node";
import Payload from "./Payload";

/**
 * A graph represents a set of nodes and their connections
 */
export default class Graph {
  private pipeline: Node<NodeProps>[];
  private nodeRegistry: Record<string, Node<NodeProps>>;

  constructor(public title: string) {
    this.pipeline = [];
  }

  public async execute(): Promise<Payload[]> {
    let outputs: Payload[] = [];
    for (const node of this.pipeline) {
      outputs = await node.process(outputs);
    }
    return outputs;
  }

  /**
   * Add a node to the graph
   * @param name a unique name for the node
   * @param node the type of node to add
   *
   * @throws Error if a node named `name` already exists on the graph
   */
  public addNode<P extends NodeProps>(name: string, node: Node<P>) {
    if (this.nodeRegistry[name] != null) {
      throw new Error(`A node named ${node} is already on this graph`);
    }
    this.nodeRegistry[name] = node;
    this.pipeline.push(node);
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
