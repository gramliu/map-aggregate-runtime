import Payload from "./Payload";
import Schema from "./Schema";

export const nodeRegistry: Record<string, RegisteredNode> = {};

export interface RegisteredNode {
  name: string;
  description: string;
  constructor: Function;
}

/**
 * Decorator to register a Map-Aggregate node
 * @param name Name of the node
 * @param description Description of the node
 */
export function MapAggregateNode(name: string, description: string) {
  return function (constructor: Function) {
    nodeRegistry[name] = {
      name,
      description,
      constructor,
    };
  };
}

export type NodeProps = Record<string, unknown>;

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
}
