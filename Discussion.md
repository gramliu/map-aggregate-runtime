- Node should accept payloads of type `T extends InputSchema` so additional fields are allowed
- Should we separate input ports from payloads?
  It's always a single pipeline

```ts
enum AggregateOperation {
  count = "count"
  average = "average
}

interface AggregateSchema extends Schema<T> {
  payloads: T[];
  aggregateTarget: string;
  operation: AggregateOperation;
  groupKey?: string;
}

class AggregateNode extends Node<AggregateSchema<T>, T> {
}
```
