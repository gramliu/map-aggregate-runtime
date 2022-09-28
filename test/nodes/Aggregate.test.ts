import { processPayloads } from "../testUtil";
import Aggregate from "../../src/nodes/Aggregate";

test("Count is correct", async () => {
  const node = new Aggregate({ operation: "count" });
  const output = await processPayloads(10, node);
  expect(output.length).toBe(1);

  const payload = output[0];
  expect(payload.contentValue).toBe(10);
});

test("Average is correct", async () => {
  const node = new Aggregate({ operation: "average" });
  const output = await processPayloads(10, node);
  expect(output.length).toBe(1);

  const payload = output[0];
  expect(payload.contentValue).toBe(4.5);
});

test("Average throws for 0 payloads", async () => {
  const node = new Aggregate({ operation: "average" });
  await expect(async () => {
    await processPayloads(0, node);
  }).rejects.toThrow();
});

test("Sum is correct", async () => {
  const node = new Aggregate({ operation: "sum" });
  const output = await processPayloads(10, node);
  expect(output.length).toBe(1);

  const payload = output[0];
  expect(payload.contentValue).toBe(45);
});

test("Sum is 0 for empty payloads", async () => {
  const node = new Aggregate({ operation: "sum" });
  const output = await processPayloads(0, node);
  expect(output.length).toBe(1);

  const payload = output[0];
  expect(payload.contentValue).toBe(0);
});

test("Group sum is correct", async () => {
  const groupCount = 5;
  const elementCount = 10;

  const input = [];
  for (let i = 0; i < groupCount; i++) {
    for (let j = 0; j < elementCount; j++) {
      const value = i * elementCount + j;
      input.push({
        contentType: `Group ${i}`,
        contentValue: value
      });
    }
  }
  const node = new Aggregate({ operation: "group_sum", groupKey: "contentType" })
  const output = await node.process(input);

  expect(input.length).toBe(groupCount * elementCount);
  expect(output.length).toBe(groupCount);

  const elementSum = (elementCount * (elementCount - 1)) / 2;
  for (let i = 0; i < groupCount; i++) {
    const payload = output[i];
    expect(payload.contentValue).toBe(i * elementCount * elementCount + elementSum);
  }
});
