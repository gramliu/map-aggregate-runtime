import Graph from "./core/Graph";
import Aggregate from "./nodes/Aggregate";
import Inject from "./nodes/Inject";

const data = [];
for (let i = 0; i < 5; i++) {
  data.push({
    contentType: "dummy",
    contentValue: 0,
  });
}

const injectNode = new Inject({ data });

const aggregateNode = new Aggregate({
  target: "contentValue",
  operation: "count",
  groupKey: "",
});

const graph = new Graph("Counter");
graph.addNode("Inject", injectNode);
graph.addNode("Count", aggregateNode);

(async () => {
  const results = await graph.execute();
  console.log(results);
})();
