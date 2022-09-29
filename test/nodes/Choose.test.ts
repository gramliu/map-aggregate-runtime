import { processPayloads } from "@test/testUtil";
import Choose from "@nodes/Choose";

test("Choose gets no more than k payloads", async () => {
  const chooseNode = new Choose({ count: 5 });
  const output = await processPayloads(10, chooseNode);
  expect(output.length).toBe(5);
});

test("Choose does not truncate if less than k", async () => {
  const chooseNode = new Choose({ count: 5 });
  const output = await processPayloads(3, chooseNode);
  expect(output.length).toBe(3);
});
