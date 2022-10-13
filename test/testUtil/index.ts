import type Node from "../../src/core/Node";
import type { NodeProps } from "../../src/core/Node";
import type Payload from "../../src/core/Payload";

/**
 * Generate `n` dummy payloads
 */
export function generatePayloads(n: number): Payload[] {
  const payloads = [] as Payload[];
  for (let i = 0; i < n; i++) {
    payloads.push({
      contentType: "dummy",
      contentValue: i,
    });
  }
  return payloads;
}

/**
 * Generate `n` dummy payloads and pass into `node`
 * Returns the output from the node
 */
export async function processPayloads<T extends Node<NodeProps>>(
  n: number,
  node: T
): Promise<Payload[]> {
  const payloads = generatePayloads(n);
  return await node.process(payloads);
}
