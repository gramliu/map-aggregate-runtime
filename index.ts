import Node from "./src/Node";

interface FuzzNodeInput {
  inputA: string;
  inputB: number;
}

interface FuzzNodeOutput {
  result: string;
}

class FuzzNode extends Node<FuzzNodeInput, FuzzNodeOutput> {
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

  async process(input: FuzzNodeInput): Promise<FuzzNodeOutput> {
    return {
      result: "hello",
    };
  }
}
