import GraphLoader from "./core/GraphLoader";
import fs from "fs";
import Payload from "core/Payload";

(async () => {
  const manifest = fs.readFileSync("./input/basic.mf").toString();
  const graph = GraphLoader.parse(manifest);
  const dummyData = [] as Payload[];
  for (let i = 0; i < 10; i++) {
    dummyData.push({
      contentType: "data",
      contentValue: 5,
    });
  }
  const result = await graph.execute(dummyData, true);
  console.log(result);
})();
