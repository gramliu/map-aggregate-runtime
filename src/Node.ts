import SchemaProperty from "./InputProperty";
import Payload from "./Payload";

// TODO: Figure out how to enforce typing of parameter values for input and output
// based on input schema. Look at how mongoose does this
// https://mongoosejs.com/docs/typescript.html

/**
 * A node represents a single function in a map-aggregate manifest
 */
export default abstract class Node<Schema, T> {
  constructor(
    public name: string,
    public description: string,
    public inputs: {
      [key in keyof Schema]: SchemaProperty<Schema[key]>;
    }
  ) {}

  /**
   * Process a set of `input`, as described by the node's `inputs`
   * to a set of outputs, as described by the node's `output`s
   */
  abstract process(input: Schema, payloads: Payload[]): Promise<T[]>;

  /**
   * Returns true if `name` names an input property on this node and false otherwise
   */
  public hasSchemaProperty(name: string): boolean {
    return name in this.inputs;
  }

  /**
   * Get an input property on this node
   * @throws an error if the key does not name an input property on this node
   */
  public getSchemaProperty(
    name: keyof Schema
  ): SchemaProperty<Schema[keyof Schema]> {
    if (this.inputs[name as keyof Schema] == null) {
      throw new Error(
        `${String(name)} does not name an input property on node ${this.name}`
      );
    }
    return this.inputs[name as keyof Schema];
  }

  /**
   * Returns true if the specified property on the schema holds a value
   */
  public hasValue(propertyName: keyof Schema): boolean {
    return this.getSchemaProperty(propertyName).value !== undefined;
  }

  /**
   * Get the value of the specified schema property
   */
  public getValue(propertyName: keyof Schema): Schema[keyof Schema] {
    return this.getSchemaProperty(propertyName).value;
  }
}
