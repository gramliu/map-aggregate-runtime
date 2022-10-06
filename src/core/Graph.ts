import GraphLoader from "./GraphLoader";
import type Node from "./Node";
import type { NodeProps } from "./Node";
import Payload, { ScalarType } from "./Payload";

/**
 * A graph represents a set of nodes and their connections
 */
export default class Graph {
  private readonly pipeline: string[];
  private readonly nodeRegistry: Record<string, Node<NodeProps>>;
  private readonly runtimeParams: Record<string, Set<string>>;
  private readonly requiredHardware: string[];

  constructor(public readonly title: string) {
    this.pipeline = [];
    this.nodeRegistry = {};
    this.runtimeParams = {};
    this.requiredHardware = [];
  }

  /**
   * Run the graph with the input, if specified
   */
  public async execute(
    data: Payload[] = [],
    input: Record<string, ScalarType> = {},
    debug: boolean = false
  ): Promise<Payload[]> {
    let payloads: Payload[] = data;
    for (const nodeName of this.pipeline) {
      const node = this.nodeRegistry[nodeName];
      if (debug) {
        console.log(`Running node: ${nodeName} (${node.getType()})`);
        console.log("Data:", payloads);
      }
      payloads = await node.process(payloads);
    }
    if (debug) {
      console.log("Output:", payloads);
      console.log("=====");
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
   * Register a hardware device required by this graph
   */
  public addHardware(hardware: string) {
    this.requiredHardware.push(hardware);
  }

  /**
   * Register a runtime input parameter to a specific node
   */
  public addInput(nodeName: string, property: string) {
    if (this.nodeRegistry[nodeName] == null) {
      throw new Error(`No such node found: "${nodeName}"`);
    }
    const node = this.nodeRegistry[nodeName];
    if (!node.hasProperty(property)) {
      const nodeType = node.getType();
      throw new Error(
        `Node '${nodeName}' of type '${nodeType}' does not have property '${property}'`
      );
    }
    if (!this.runtimeParams[nodeName]) {
      this.runtimeParams[nodeName] = new Set();
    }
    this.runtimeParams[nodeName].add(property);
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
    const pipelineStr = this.pipeline.join(" -> ");
    return `Graph{title: "${this.title}", hardware: "${this.requiredHardware}", pipeline: "${pipelineStr}", nodes: "${this.nodeRegistry}"}`;
  }
}
