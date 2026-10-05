import { resolveCompare, type Comparator } from "./compare.js";

export function nextPermutationInPlace<T>(
  values: T[],
  options?: {
    compare?: Comparator<T>;
    wrapAround?: boolean;
  },
): boolean {
  const compare = resolveCompare(values, options?.compare);
  const advanced = advanceNext(values, compare);
  if (!advanced && options?.wrapAround !== false) {
    reverseRange(values, 0, values.length - 1);
  }
  return advanced;
}

export function nextPermutation<T>(
  values: readonly T[],
  options?: { compare?: Comparator<T>; wrapAround?: true },
): T[];
export function nextPermutation<T>(
  values: readonly T[],
  options: { compare?: Comparator<T>; wrapAround: false },
): T[] | null;
export function nextPermutation<T>(
  values: readonly T[],
  options?: { compare?: Comparator<T>; wrapAround?: boolean },
): T[] | null;
export function nextPermutation<T>(
  values: readonly T[],
  options?: {
    compare?: Comparator<T>;
    wrapAround?: boolean;
  },
): T[] | null {
  const copy = values.slice();
  const advanced = nextPermutationInPlace(copy, options);
  if (!advanced && options?.wrapAround === false) {
    return null;
  }
  return copy;
}

function advanceNext<T>(values: T[], compare: Comparator<T>): boolean {
  let pivot = values.length - 2;
  while (pivot >= 0 && compare(values[pivot], values[pivot + 1]) >= 0) {
    pivot--;
  }
  if (pivot < 0) {
    return false;
  }

  let successor = values.length - 1;
  while (compare(values[pivot], values[successor]) >= 0) {
    successor--;
  }

  swap(values, pivot, successor);
  reverseRange(values, pivot + 1, values.length - 1);
  return true;
}

function swap<T>(values: T[], left: number, right: number): void {
  const current = values[left];
  values[left] = values[right];
  values[right] = current;
}

function reverseRange<T>(values: T[], from: number, to: number): void {
  while (from < to) {
    swap(values, from, to);
    from++;
    to--;
  }
}
