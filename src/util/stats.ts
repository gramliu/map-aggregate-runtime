/**
 * Return the mean of `arr`
 */
export function getMean(arr: number[]): number {
    if (arr.length == 0) {
        throw new Error("Cannot compute mean on an array of length 0!")
    }
    return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}