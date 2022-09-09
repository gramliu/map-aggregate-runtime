import { InputPort, OutputPort } from "./Port";

// TODO: Figure out how to enforce typing of parameter values for input and output
// based on input schema. Look at how mongoose does this
// https://mongoosejs.com/docs/typescript.html
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
}
