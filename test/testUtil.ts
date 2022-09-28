import type Payload from "@core/Payload";

export function generatePayloads(n: number): Payload[] {
  const payloads = Array(n).map((i) => ({
    contentType: "dummy",
    contentValue: i,
  }));
  return payloads;
}
