declare class Arima {
    train(data: number[]): Arima;
    predict(steps: number): [number[], number[]];
}

interface ArimaArgs {
    p?: number;
    d?: number;
    q?: number;
    P?: number;
    D?: number;
    Q?: number;
    S?: number;
    verbose?: boolean;
}

type ArimaConstructor = new (args: ArimaArgs) => Arima
declare const arimaConstructorConst: ArimaConstructor

declare module "arima" {
    export = arimaConstructorConst
}