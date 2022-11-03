import {Payload} from "../core";

/**
 * Returns the content type of the first payload, if `payloads` is not empty.
 * Otherwise, returns `defaultContentType`
 */
export default function getContentType(payloads: Payload[], defaultContentType: string = ""): string {
    return payloads.length == 0 ? defaultContentType : payloads[0].contentType
}