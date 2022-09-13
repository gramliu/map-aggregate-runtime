# Map-Aggregate Runtime

A different flow-based runtime.

## Format

```
TITLE: Example Flow

RetrieveData(
  type: "node-flow/NetworkPull",
  url: "https://api.example.com/data"
  method: "GET"
)
Map(
  type: "my-package/Map",
)
SendData(
  type: "node-flow/NetworkPush",
  url: "https://api.example.com/endpoint"
  method: "POST"
)

INPUT: RetrieveData.url
INPUT: RetrieveData.method

INPUT: SendData.url
INPUT: SendData.method

OUTPUT: SendData

RetrieveData -> Map
Map -> SendData
```

## Parameters

Nodes are declared as follows:

```
PullData(
  source: nodeflow/Pull,
  url: "https://api.example.com/data"
)
```
