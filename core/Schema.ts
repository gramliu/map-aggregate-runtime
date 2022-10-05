/**
 * A SchemaProperty describes a compile-time parameter to a node
 */
export interface SchemaPropertyInfo<T> {
  description: string;
  defaultValue?: T;
  required?: boolean;
  overridable?: boolean;
}

type Schema<P extends Record<string, unknown>> = {
  [key in keyof P]: SchemaPropertyInfo<P[key]>;
};

export default Schema;
