import { InputPort, OutputPort } from "./Port";

// TODO: Figure out how to enforce typing of parameter values for input and output
// based on input schema. Look at how mongoose does this
// https://mongoosejs.com/docs/typescript.html

/**
 * A node represents a single function in a flow-based program
 */
export default abstract class Node<InputSchema, OutputSchema> {
  constructor(
    public name: string,
    public description: string,
    public inputs: {
      [key in keyof InputSchema]: InputPort<InputSchema[key]>;
    },
    public outputs: {
      [key in keyof OutputSchema]: OutputPort<OutputSchema[key]>;
    }
  ) {}

  /**
   * Process a set of `input`, as described by the node's `inputs`
   * to a set of outputs, as described by the node's `output`s
   */
  abstract process(input: InputSchema): Promise<OutputSchema>;

  /**
   * Returns true if `name` names an input port on this node and false otherwise
   */
  public hasInputPort(name: string): boolean {
    return name in this.inputs;
  }

  /**
   * Returns true if `name` names an output port on this node and false otherwise
   */
  public hasOutputPort(name: string): boolean {
    return name in this.outputs;
  }

  /**
   * Get an input port on this node
   * @param name the key of the input port to get
   *
   * @throws an error if the key does not name an input port on this node
   */
  public getInputPort(
    name: keyof InputSchema
  ): InputPort<InputSchema[keyof InputSchema]> {
    if (this.inputs[name as keyof InputSchema] == null) {
      throw new Error(
        `${String(name)} does not name an input port on node ${this.name}`
      );
    }
    return this.inputs[name as keyof InputSchema];
  }

  /**
   * Get an output port on this node
   * @param name the key of the output port to get
   *
   * @throws an error if the key does not name output port on this node
   */
  public getOutputPort(
    name: keyof OutputSchema
  ): OutputPort<OutputSchema[keyof OutputSchema]> {
    if (this.outputs[name as keyof OutputSchema] == null) {
      throw new Error(
        `${String(name)} does not name an output port on node ${this.name}`
      );
    }
    return this.outputs[name as keyof OutputSchema];
  }
}
