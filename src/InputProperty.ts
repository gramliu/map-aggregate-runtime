/**
 * A SchemaProperty describes a compile-time parameter to a node
 */
export default class SchemaProperty<T> {
  constructor(
    public name: string,
    public value?: T,
    public description?: string,
    public required: boolean = false,
    public overridable: boolean = false
  ) {}
}
