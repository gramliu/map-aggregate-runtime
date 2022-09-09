import { InputPort, OutputPort } from "./Port";

// TODO: Figure out how to enforce typing of parameter values for input and output
// based on input schema. Look at how mongoose does this
// https://mongoosejs.com/docs/typescript.html
export abstract class Node {
  constructor(
    public name: string,
    public description: string,
    public inputs: { [key: string]: InputPort<unknown> },
    public outputs: { [key: string]: OutputPort<unknown> }
  ) {}

  /**
   * Process a set of `input`, as described by the node's `inputs`
   * to a set of outputs, as described by the node's `output`s
   */
  abstract process(input: {
    [key in keyof Node["inputs"]]: Node["inputs"][key];
  }): Promise<{ [key in keyof Node["outputs"]]: unknown }>;
}

class FuzzNode extends Node {
  constructor() {
    super(
      "Fuzz",
      "Converts a fine-grained number into a format with coarser granularity.",
      {
        inputA: {
          name: "inputA",
          required: true,
        },
        inputB: {
          name: "inputB",
          required: true,
        },
      },
      {
        result: {
          name: "result",
          required: true,
        },
      }
    );
  }

  async process(input: {
    [key in keyof Node["inputs"]]: unknown;
  }): Promise<{ [key in keyof Node["outputs"]]: unknown }> {
    return {
      result: 3,
    };
  }
}
