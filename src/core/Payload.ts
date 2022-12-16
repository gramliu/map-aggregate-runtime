export type ScalarType = string | number | boolean;

/**
 * A payload carries data that passes through a program
 */
export default interface Payload {
  contentType: string;
  contentValue: ScalarType;
  timestamp?: number;
  lat?: number;
  lon?: number;
  addressLabel?: string;
  operationId?: string;
  [key: string]: any;
}
