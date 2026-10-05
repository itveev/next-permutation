import { describe, expect, expectTypeOf, it } from "vitest";
import {
  nextPermutationInPlace,
  permutations,
  type Comparator,
} from "../src/index.js";

function factorial(size: number): number {
  let result = 1;
  for (let value = 2; value <= size; value++) {
    result *= value;
  }
  return result;
}

function range(size: number): number[] {
  return Array.from({ length: size }, (_, index) => index);
}

function isStrictlyBefore<T>(
  left: readonly T[],
  right: readonly T[],
  compare: Comparator<T>,
): boolean {
  for (let index = 0; index < left.length; index++) {
    const order = compare(left[index], right[index]);
    if (order < 0) {
      return true;
    }
    if (order > 0) {
      return false;
    }
  }
  return false;
}

describe("permutations", () => {
  it("yields [1, 2, 3] in lexicographic order", () => {
    expect([...permutations([1, 2, 3])]).toEqual([
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ]);
  });

  it("yields only distinct permutations of repeated values", () => {
    expect([...permutations([1, 1, 2])]).toEqual([
      [1, 1, 2],
      [1, 2, 1],
      [2, 1, 1],
    ]);
    expect([...permutations([2, 1, 1])]).toEqual([
      [1, 1, 2],
      [1, 2, 1],
      [2, 1, 1],
    ]);
  });

  it("yields one empty or singleton permutation", () => {
    expect([...permutations([])]).toEqual([[]]);
    expect([...permutations([1])]).toEqual([[1]]);
  });

  it("does not mutate the input and starts from the minimum", () => {
    const values = [3, 1, 2];
    const seen = [...permutations(values)];
    expect(values).toEqual([3, 1, 2]);
    expect(seen[0]).toEqual([1, 2, 3]);
    expect(seen[0]).not.toBe(values);
  });

  it("returns an independent array on every yield", () => {
    const generated = permutations([1, 2, 3]);
    const first = generated.next().value;
    const second = generated.next().value;
    expect(first).not.toBe(second);
    first[0] = 9;
    expect(second).toEqual([1, 3, 2]);
    expect(generated.next().value).toEqual([2, 1, 3]);
  });

  it("can stop before the remaining permutations are produced", () => {
    const generated = permutations(range(7));
    expect(generated.next().value).toEqual(range(7));
    expect(generated.next().value).toEqual([0, 1, 2, 3, 4, 6, 5]);
  });

  it("matches the in-place walk for unique values", () => {
    for (let size = 0; size <= 8; size++) {
      const start = range(size);
      const generated = [...permutations(start.slice().reverse())];
      const current = start.slice();
      const stepped = [current.slice()];
      while (nextPermutationInPlace(current, { wrapAround: false })) {
        stepped.push(current.slice());
      }

      expect(generated).toHaveLength(factorial(size));
      expect(generated).toEqual(stepped);
      expect(generated[0]).toEqual(start);
      expect(generated[generated.length - 1]).toEqual(start.slice().reverse());
      expect(
        generated.every(
          (values, index) =>
            index === 0 ||
            isStrictlyBefore(generated[index - 1], values, (left, right) =>
              left < right ? -1 : left > right ? 1 : 0,
            ),
        ),
      ).toBe(true);
    }
  });

  it("counts a multiset without storing seen permutations", () => {
    const values = [2, 0, 1, 0, 1];
    const compare = (left: number, right: number) =>
      left < right ? -1 : left > right ? 1 : 0;
    const generated = [...permutations(values)];
    expect(generated).toHaveLength(factorial(5) / (factorial(2) * factorial(2)));
    expect(generated[0]).toEqual([0, 0, 1, 1, 2]);
    expect(generated[generated.length - 1]).toEqual([2, 1, 1, 0, 0]);
    expect(
      generated.every(
        (permutation, index) =>
          index === 0 || isStrictlyBefore(generated[index - 1], permutation, compare),
      ),
    ).toBe(true);
    expect(values).toEqual([2, 0, 1, 0, 1]);
  });

  it("orders strings, bigints, and compared objects", () => {
    expect([...permutations(["b", "A", "a"])]).toEqual([
      ["A", "a", "b"],
      ["A", "b", "a"],
      ["a", "A", "b"],
      ["a", "b", "A"],
      ["b", "A", "a"],
      ["b", "a", "A"],
    ]);
    expect([...permutations([2n, 1n])]).toEqual([
      [1n, 2n],
      [2n, 1n],
    ]);

    const compare = (left: { id: number }, right: { id: number }) =>
      left.id - right.id;
    const low = { id: 1, name: "a" };
    const highA = { id: 2, name: "b" };
    const highB = { id: 2, name: "c" };
    const ids = [
      ...permutations([highA, low, highB], { compare }),
    ].map((permutation) => permutation.map((user) => user.id));
    expect(ids).toEqual([
      [1, 2, 2],
      [2, 1, 2],
      [2, 2, 1],
    ]);
  });

  it("rejects a sparse array", () => {
    const values = [1, 2, 3];
    delete values[1];
    expect(() => [...permutations(values)]).toThrow(/Sparse arrays/);
  });

  it("returns a generator and does not take wrapAround", () => {
    expectTypeOf(permutations([1, 2, 3])).toEqualTypeOf<Generator<number[]>>();
    // @ts-expect-error wrapAround is only for next and previous
    permutations([1, 2, 3], { wrapAround: false });
  });
});
