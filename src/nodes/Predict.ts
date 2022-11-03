import Node from "../core/Node";
import Payload from "../core/Payload";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";
import Arima from "arima";
import getContentType from "../util/getContentType";

export type PredictProps = {
  target?: string;
  steps: number;
  p?: number;
  d?: number;
  q?: number;
  P?: number;
  D?: number;
  Q?: number;
  S?: number;
};

@MapAggregateNode("Predict", "Predict data from time-series data using ARIMA")
export default class Predict extends Node<PredictProps> {
  async process(
    input: Payload[],
    params?: Partial<PredictProps>
  ): Promise<Payload[]> {
    const { target, steps, p, d, q, P, D, Q, S } = this.getLocalParams(params);
    const arimaInput = input.map((payload) => payload[target]) as number[];
    if (arimaInput.length == 0) {
      throw new Error("Cannot predict on empty time series!");
    }
    if (typeof arimaInput[0] !== "number") {
      throw new Error(`Cannot predict on non-numeric time series data: ${JSON.stringify(this.params)} ${target}`)
    }
    const contentType = getContentType(input, "prediction");
    const arima = new Arima({ p, d, q, P, D, Q, S, verbose: false }).train(
      arimaInput
    );
    const [prediction, _] = arima.predict(steps);

    return prediction.map((value, idx) => ({
      contentType,
      operationId: `prediction-${idx}`,
      contentValue: value,
    })) as Payload[];
  }

  getSchema(): Schema<Required<PredictProps>> {
    return {
      target: {
        description: "The target on payloads to predict",
        defaultValue: "contentValue",
      },
      steps: {
        description: "Number of samples to predict",
        defaultValue: 5,
      },
      p: {
        description: "Order of autoregressive term",
        defaultValue: 1,
      },
      d: {
        description: "Degree of first differencing",
        defaultValue: 0,
      },
      q: {
        description: "Order of moving average",
        defaultValue: 1,
      },
      P: {
        description: "Order of seasonal autoregressive term",
        defaultValue: 0,
      },
      D: {
        description: "Degree of seasonal first differencing",
        defaultValue: 0,
      },
      Q: {
        description: "Order of seasonal moving average",
        defaultValue: 0,
      },
      S: {
        description: "Number of measurements per season",
        defaultValue: 0,
      },
    };
  }
}
