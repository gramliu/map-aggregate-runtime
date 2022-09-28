import { processPayloads } from "../testUtil";
import Aggregate from "@nodes/Aggregate";

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
})