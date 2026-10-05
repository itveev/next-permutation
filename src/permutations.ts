import { resolveCompare, type Comparator } from "./compare.js";
import { nextPermutationInPlace } from "./nextPermutation.js";

export function* permutations<T>(
  values: readonly T[],
  options?: { compare?: Comparator<T> },
): Generator<T[]> {
  const compare = resolveCompare(values, options?.compare);
  const current = values.slice().sort(compare);
  yield current.slice();
  while (nextPermutationInPlace(current, { compare, wrapAround: false })) {
    yield current.slice();
  }
}
