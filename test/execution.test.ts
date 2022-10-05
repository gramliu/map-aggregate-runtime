import GraphLoader from "@core/GraphLoader";
import Payload from "@core/Payload";
import * as fs from "fs";

test("Graph execution works normally", async () => {
  const manifest = fs.readFileSync("input/basic.mf").toString();
  const graph = GraphLoader.parse(manifest);
  const dummyData = [] as Payload[];
  for (let i = 0; i < 10; i++) {
    dummyData.push({
      contentType: "data",
      contentValue: 5,
    });
  }
  await graph.execute(dummyData);
});
