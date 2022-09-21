# Map-Aggregate Runtime

A different flow-based runtime.

## Format

```
TITLE: Example Flow
PIPELINE: RetrieveData -> Map -> Aggregate

RetrieveData(
  type: "node-flow/NetworkPull",
  url: "https://api.example.com/data"
  method: "GET"
)
Map(
  type: "my-package/Map",
)
Aggregate(
  type: "node-flow/Aggregate",
  operation: "sum"
)

INPUT: RetrieveData.url
INPUT: RetrieveData.method
INPUT: Aggregate.operation
```

## Parameters

Nodes are declared as follows:

```
PullData(
  source: nodeflow/Pull,
  url: "https://api.example.com/data"
)
```
