import GraphLoader from "./GraphLoader";
import type { Node, NodeProps } from "./Node";
import Payload from "./Payload";

/**
 * A graph represents a set of nodes and their connections
 */
export default class Graph {
  private pipeline: string[];
  private nodeRegistry: Record<string, Node<NodeProps>>;

  constructor(public readonly title: string) {
    this.pipeline = [];
    this.nodeRegistry = {};
  }

  /**
   * Run the graph with the input, if specified
   */
  public async execute(
    input: Payload[] = [],
    debug: boolean = false
  ): Promise<Payload[]> {
    let payloads: Payload[] = input;
    for (const nodeName of this.pipeline) {
      const node = this.nodeRegistry[nodeName];
      if (debug) {
        console.log(`Running node: ${nodeName} (${node.getType()})`);
        console.log("Input:", payloads);
      }
      payloads = await node.process(payloads);
      if (debug) {
        console.log("Output:", payloads);
        console.log("=====");
      }
    }
    return payloads;
  }

  /**
   * Add a node to the graph
   * @param name a unique name for the node
   * @param node the type of node to add
   *
   * @throws Error if a node named `name` already exists on the graph
   */
  public addNode<P extends NodeProps>(name: string, node: Node<P>) {
    if (node == null) {
      throw new Error("Cannot add a null node to the graph!");
    }
    if (this.nodeRegistry[name] != null) {
      throw new Error(`A node named ${node} is already on this graph`);
    }
    this.nodeRegistry[name] = node;
    this.pipeline.push(name);
  }

  /**
   * Load a graph from a string
   */
  public static fromString(graphString: string): Graph {
    return GraphLoader.parse(graphString);
  }

  /**
   * Return a string representation of this graph
   */
  public toString(): String {
    const serializedPipeline = this.pipeline.map((node) => node.getType());
    const pipelineStr = serializedPipeline.join(" -> ");
    return `Graph{title: "${this.title}", pipeline: "${pipelineStr}"}`;
  }
}
