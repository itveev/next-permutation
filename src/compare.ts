export type Comparator<T> = (a: T, b: T) => number;

export function resolveCompare<T>(
  values: readonly T[],
  compare: Comparator<T> | undefined,
): Comparator<T> {
  if (!Array.isArray(values)) {
    throw new TypeError("Expected an array.");
  }

  for (let index = 0; index < values.length; index++) {
    if (!(index in values)) {
      throw new TypeError("Sparse arrays are not supported.");
    }
  }

  if (compare !== undefined) {
    return compare;
  }

  assertDefaultOrdered(values);
  return defaultCompare as Comparator<T>;
}

function assertDefaultOrdered(values: readonly unknown[]): void {
  let expected: "number" | "string" | "bigint" | undefined;

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (typeof value === "number" && Number.isNaN(value)) {
      throw new TypeError("NaN is not ordered. Pass a compare function.");
    }

    const type = typeof value;
    if (type !== "number" && type !== "string" && type !== "bigint") {
      throw new TypeError(
        `Cannot order ${typeName(value)} without a compare function.`,
      );
    }

    if (expected === undefined) {
      expected = type;
    } else if (type !== expected) {
      throw new TypeError(
        `Cannot order mixed types (${expected} and ${type}). Pass a compare function.`,
      );
    }
  }
}

function typeName(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value instanceof Date) {
    return "Date";
  }
  return typeof value;
}

function defaultCompare(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") {
    return left < right ? -1 : left > right ? 1 : 0;
  }
  if (typeof left === "string" && typeof right === "string") {
    return left < right ? -1 : left > right ? 1 : 0;
  }
  if (typeof left === "bigint" && typeof right === "bigint") {
    return left < right ? -1 : left > right ? 1 : 0;
  }
  throw new TypeError("Cannot order values without a compare function.");
}
