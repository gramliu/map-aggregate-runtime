import type Payload from "../src/core/Payload";
import type { Node, NodeProps } from "../src/core/Node";

/**
 * Generate `n` dummy payloads
 */
export function generatePayloads(n: number): Payload[] {
  const payloads = [];
  for (let i = 0; i < n; i++) {
    payloads.push({
      contentType: "dummy",
      contentValue: i,
    })
  }
  return payloads;
}

/**
 * Generate `n` dummy payloads and pass into `node`
 * Returns the output from the node
 */
export async function processPayloads(
  n: number,
  node: Node<NodeProps>
): Promise<Payload[]> {
  const payloads = generatePayloads(n);
  return await node.process(payloads);
}
