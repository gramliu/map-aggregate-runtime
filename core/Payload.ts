export type ScalarType = string | number | boolean;

/**
 * A payload carries data that passes through a program
 */
export default interface Payload {
  contentType: string;
  contentValue: ScalarType;
  timestamp?: number;
  geo?: {
    lat: number;
    lon: number;
  };
  [key: string]: any;
}
