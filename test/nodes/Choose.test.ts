import { generatePayloads } from "../testUtil";
import Choose from "@nodes/Choose";

test("Choose gets no more than k payloads", async () => {
  const input = generatePayloads(10);
  const chooseNode = new Choose({ count: 5 });
  const output = await chooseNode.process(input);

  expect(input.length).toBe(10);
  expect(output.length).toBe(5);
});

test("Choose does not truncate if less than k", async () => {
  const input = generatePayloads(3);
  const chooseNode = new Choose({ count: 5 });
  const output = await chooseNode.process(input);

  expect(input.length).toBe(3);
  expect(output.length).toBe(3);
})