/**
 * An error that occurs while parsing a Map-Aggregate manifest
 */
export default class ParseError extends Error {
  public readonly name: string = "Parse Error";

  constructor(public readonly message: string, public readonly cause?: Error) {
    super(message);
  }
}
