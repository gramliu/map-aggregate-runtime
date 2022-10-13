import { processPayloads } from "../testUtil";
import Predict from "../../src/nodes/Predict";

test("Predict time series", async () => {
  const predictNode = new Predict({ steps: 7, p: 1, d: 2, q: 1 });
  const output = await processPayloads(10, predictNode);
  expect(output.length).toBe(7);
  const start = 10;
  for (let i = 0; i < 7; i++) {
    expect(output[0].contentValue == start + i);
  }
});

