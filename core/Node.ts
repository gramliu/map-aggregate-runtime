import Payload from "./Payload";
import Schema from "./Schema";

export type NodeProps = Record<string, unknown>;
type NodeConstructor<P extends NodeProps, T extends Node<P>> = new (
  params: P
) => T;

export interface RegisteredNode<P extends NodeProps, T extends Node<P>> {
  name: string;
  description: string;
  constructor: NodeConstructor<P, T>;
}

const nodeRegistry: Record<
  string,
  RegisteredNode<NodeProps, Node<NodeProps>>
> = {};

/**
 * Get a node by its name
 */
export function getRegisteredNode(
  name: string
): RegisteredNode<NodeProps, Node<NodeProps>> {
  return nodeRegistry[name];
}

/**
 * Decorator to register a Map-Aggregate node
 * @param name Name of the node
 * @param description Description of the node
 */
export function MapAggregateNode(name: string, description: string) {
  return function <P extends NodeProps, T extends Node<P>>(
    constructor: NodeConstructor<P, T>
  ) {
    nodeRegistry[name] = {
      name,
      description,
      constructor,
    };

    constructor.prototype.name = name;
    constructor.prototype.description = description;
  };
}

/**
 * A node represents a single function in a map-aggregate manifest
 */
export abstract class Node<P extends NodeProps> {
  constructor(protected readonly params: P) {}

  /**
   * Process a set of `input`, as described by the node's `inputs`
   * to a set of outputs, as described by the node's `output`s
   */
  abstract process(input: Payload[]): Promise<Payload[]>;

  /**
   * Return the schema associated with this node
   */
  abstract getSchema(): Schema<P>;

  /**
   * Return a string representation of this node
   */
  toString(): string {
    const nodeType = Object.getPrototypeOf(this).name;
    return `Node{type: "${nodeType}", params: ${this.params}}`;
  }

  /**
   * Returns the type of this node, if it was registered
   * with the @MapAggregateNode annotation
   */
  getType(): string {
    const nodeType = Object.getPrototypeOf(this).name;
    return nodeType;
  }

  /**
   * Returns the descriptions for this node type, if it was registered
   * with the @MapAggregateNode annotation
   */
  getDescription(): string {
    const description = Object.getPrototypeOf(this).description;
    return description;
  }
}
