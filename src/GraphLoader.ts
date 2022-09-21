import Graph from "./Graph";

/**
 * Utility class for loading graphs from different sources
 */
export default class GraphLoader {
  /**
   * Generate a graph from a string
   *
   * @throws an error if an expected component was not found
   */
  public static fromString(graphString: string): Graph {
    const lines = graphString.split("\n");
    const title = this.getFirstWithTag(lines, "TITLE");

    return new Graph(title);
  }

  private static getFirstWithTag(lines: string[], tag: string) {
    tag += ": ";
    const line = lines.find((line) => line.startsWith(tag));
    if (line == null) {
      throw new Error(`Line with tag "${tag}" was not found!`);
    }
    const value = line.substring(tag.length);
    return value;
  }

  private static getAllWithTag(lines: string[], tag: string) {
    const matching = lines.filter((line) => line.startsWith(tag));
    const values = matching.map((line) => line.substring(tag.length));
    return values;
  }
}
