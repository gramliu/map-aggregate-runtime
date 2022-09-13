export type ScalarType = string | number | boolean;

export default interface Payload {
  contentType: string;
  contentValue: ScalarType;
  timestamp: number;
  geo?: {
    lat: number;
    lon: number;
  };
  [key: string]: any;
}
