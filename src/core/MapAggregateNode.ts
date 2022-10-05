import Node, { NodeProps } from "@core/Node";

export type NodeConstructor<P extends NodeProps, T extends Node<P>> = new (
  params: P
) => T;

export interface RegisteredNode<P extends NodeProps, T extends Node<P>> {
  name: string;
  description: string;
  constructor: NodeConstructor<P, T>;
}

// Mapping of node names to their constructors
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
export default function MapAggregateNode(name: string, description: string) {
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
