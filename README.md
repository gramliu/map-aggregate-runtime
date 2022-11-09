# Map-Aggregate Runtime

A different flow-based runtime.

## Format

```
TITLE: Example Flow
PIPELINE: MatchStreet -> Count

MatchStreet(
  type: "Filter",
  operation: "===",
  target: "streetName",
  targetValue: "Forbes Avenue"
)
Count(
  type: "Aggregate",
  operation: "count"
)

INPUT: MatchStreet.targetValue
```

## Parameters

Nodes are declared as follows:

```
MatchStreet(
  type: "Filter",
  operation: "===",
  target: "streetName",
  targetValue: "Forbes Avenue"
)
```
`type` is a required parameter for every node declaration. This declares the type of the node.

The remaining parameters are specific to each node.