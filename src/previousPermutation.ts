import { resolveCompare, type Comparator } from "./compare.js";

export function previousPermutationInPlace<T>(
  values: T[],
  options?: {
    compare?: Comparator<T>;
    wrapAround?: boolean;
  },
): boolean {
  const compare = resolveCompare(values, options?.compare);
  const advanced = advancePrevious(values, compare);
  if (!advanced && options?.wrapAround !== false) {
    reverseRange(values, 0, values.length - 1);
  }
  return advanced;
}

export function previousPermutation<T>(
  values: readonly T[],
  options?: { compare?: Comparator<T>; wrapAround?: true },
): T[];
export function previousPermutation<T>(
  values: readonly T[],
  options: { compare?: Comparator<T>; wrapAround: false },
): T[] | null;
export function previousPermutation<T>(
  values: readonly T[],
  options?: { compare?: Comparator<T>; wrapAround?: boolean },
): T[] | null;
export function previousPermutation<T>(
  values: readonly T[],
  options?: {
    compare?: Comparator<T>;
    wrapAround?: boolean;
  },
): T[] | null {
  const copy = values.slice();
  const advanced = previousPermutationInPlace(copy, options);
  if (!advanced && options?.wrapAround === false) {
    return null;
  }
  return copy;
}

function advancePrevious<T>(values: T[], compare: Comparator<T>): boolean {
  let pivot = values.length - 2;
  while (pivot >= 0 && compare(values[pivot], values[pivot + 1]) <= 0) {
    pivot--;
  }
  if (pivot < 0) {
    return false;
  }

  let predecessor = values.length - 1;
  while (compare(values[pivot], values[predecessor]) <= 0) {
    predecessor--;
  }

  swap(values, pivot, predecessor);
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
