import GraphLoader from "./GraphLoader";
import type Node from "./Node";
import type { NodeProps } from "./Node";
import Payload, { ScalarType } from "./Payload";

export type NodeParameterOverride = Record<string, ScalarType>;
export type GraphParameterOverride = Record<string, NodeParameterOverride>;

/**
 * A graph represents a set of nodes and their connections
 */
export default class Graph {
  private readonly pipeline: string[];
  private readonly nodeRegistry: Record<string, Node<NodeProps>>;
  private readonly runtimeParameters: Record<string, Set<string>>;
  private readonly requiredHardware: string[];

  constructor(public readonly title: string) {
    this.pipeline = [];
    this.nodeRegistry = {};
    this.runtimeParameters = {};
    this.requiredHardware = [];
  }

  /**
   * Execute this graph.
   *
   * @param data an array of `Payload` to inject into the first node in the graph
   * @param overrides a mapping of nodes to runtime parameters to override
   * Each key in `input` should correspond to a node on this graph.
   * Each corresponding value should be a mapping of properties on that node
   * to the overriding values
   * @param debug if true, prints the output after each node
   */
  public async execute(
    data: Payload[] = [],
    overrides: GraphParameterOverride = {},
    debug: boolean = false
  ): Promise<Payload[]> {
    this.assertValidOverride(overrides);

    let payloads: Payload[] = data;
    for (const nodeName of this.pipeline) {
      const node = this.nodeRegistry[nodeName];
      if (debug) {
        console.log(`Running node: ${nodeName} (${node.getType()})`);
        console.log("Data:", payloads);
      }

      const paramOverrides = overrides[nodeName] ?? {};
      payloads = await node.process(payloads, paramOverrides);
    }
    if (debug) {
      console.log("Output:", payloads);
      console.log("=====");
    }
    return payloads;
  }

  /**
   * Assert that all specified overrides are for nodes on this graph
   * Assert that all node parameter overrides are for registered graph inputs
   */
  private assertValidOverride(overrides: GraphParameterOverride) {
    // Assert that all overrides are for nodes on this graph
    for (const overrideNode of Object.keys(overrides)) {
      if (!this.hasNode(overrideNode)) {
        throw new Error("Invalid override! No such node: " + overrideNode);
      }
    }

    // Assert that all parameter overrides are registered
    for (const overrideNode of Object.keys(overrides)) {
      const nodeOverride = overrides[overrideNode];
      for (const overrideProperty of Object.keys(nodeOverride)) {
        if (!this.hasParameter(overrideNode, overrideProperty)) {
          throw new Error(
            `Invalid override! Node "${overrideNode}" has no overridable parameter "${overrideProperty}`
          );
        }
      }
    }
  }

  /**
   * Add a node to the graph
   * @param name a unique name for the node
   * @param node the type of node to add
   *
   * @throws Error if node is null or a node with the same name already exists on the graph
   */
  public addNode<P extends NodeProps>(name: string, node: Node<P>) {
    if (node == null) {
      throw new Error("Cannot add a null node to the graph!");
    }
    if (this.hasNode(name)) {
      throw new Error(`A node named ${node} is already on this graph`);
    }
    this.nodeRegistry[name] = node;
    this.pipeline.push(name);
  }

  /**
   * Returns true if the specified node exists on this graph
   */
  public hasNode(name: string): boolean {
    return this.nodeRegistry[name] != null;
  }

  /**
   * Register a hardware device required by this graph
   */
  public addHardware(hardware: string) {
    this.requiredHardware.push(hardware);
  }

  /**
   * Register a runtime parameter to the specified node
   * @throws if no node with the specified name is on the graph
   * @throws if the specified node exists but does not contain the specified property
   */
  public addParameter(nodeName: string, property: string) {
    if (!this.hasNode(nodeName)) {
      throw new Error(`No such node found on this graph: "${nodeName}"`);
    }
    const node = this.nodeRegistry[nodeName];
    if (!node.hasProperty(property)) {
      const nodeType = node.getType();
      throw new Error(
        `Node '${nodeName}' of type '${nodeType}' does not have property '${property}'`
      );
    }
    if (!this.runtimeParameters[nodeName]) {
      this.runtimeParameters[nodeName] = new Set();
    }
    this.runtimeParameters[nodeName].add(property);
  }

  /**
   * Returns true if the specified nodeName has a runtime parameter to the specified property
   * @throws if the specified node does not exist on this graph
   */
  public hasParameter(nodeName: string, property: string): boolean {
    if (!this.hasNode(nodeName)) {
      throw new Error("No such node found on this graph: " + nodeName);
    }
    if (!this.runtimeParameters[nodeName]) {
      return false;
    }
    return this.runtimeParameters[nodeName].has(property);
  }

  /**
   * Load a graph from a string
   *
   * @throws an error if an expected component was not found or
   * an error otherwise occured while parsing
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
