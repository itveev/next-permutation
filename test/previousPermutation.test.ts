import { describe, expect, expectTypeOf, it } from "vitest";
import {
  permutations,
  previousPermutation,
  previousPermutationInPlace,
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

describe("previousPermutation", () => {
  it("returns the previous lexicographic permutation", () => {
    expect(previousPermutation([1, 3, 2])).toEqual([1, 2, 3]);
    expect(previousPermutation([2, 1, 3])).toEqual([1, 3, 2]);
    expect(previousPermutation([3, 2, 1])).toEqual([3, 1, 2]);
  });

  it("wraps the first permutation to the last", () => {
    const values = [1, 2, 3];
    expect(previousPermutationInPlace(values)).toBe(false);
    expect(values).toEqual([3, 2, 1]);
    expect(previousPermutation([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it("leaves the array unchanged and returns null when wrapAround is false", () => {
    const values = [1, 2, 3];
    expect(previousPermutationInPlace(values, { wrapAround: false })).toBe(
      false,
    );
    expect(values).toEqual([1, 2, 3]);
    expect(previousPermutation([1, 2, 3], { wrapAround: false })).toBeNull();
    expect(previousPermutation([1, 3, 2], { wrapAround: false })).toEqual([
      1, 2, 3,
    ]);
  });

  it("does not mutate the input from the immutable API", () => {
    const values = [2, 1, 3];
    const result = previousPermutation(values);
    expect(values).toEqual([2, 1, 3]);
    expect(result).toEqual([1, 3, 2]);
    expect(result).not.toBe(values);
  });

  it("mutates the same array from the in-place API", () => {
    const values = [1, 3, 2];
    expect(previousPermutationInPlace(values)).toBe(true);
    expect(values).toEqual([1, 2, 3]);
  });

  it("treats empty, singleton, and equal elements as a single permutation", () => {
    for (const values of [[], [1], [4, 4]] as number[][]) {
      const wrapped = values.slice();
      expect(previousPermutationInPlace(wrapped)).toBe(false);
      expect(wrapped).toEqual(values);
      expect(previousPermutation(values)).toEqual(values);
      expect(previousPermutation(values, { wrapAround: false })).toBeNull();

      const held = values.slice();
      expect(
        previousPermutationInPlace(held, { wrapAround: false }),
      ).toBe(false);
      expect(held).toEqual(values);
    }
  });

  it("walks backward through the same permutations next would visit", () => {
    for (let size = 0; size <= 8; size++) {
      const forward = [...permutations(range(size))];
      const current = range(size).reverse();
      const backward = [current.slice()];
      while (previousPermutationInPlace(current, { wrapAround: false })) {
        backward.push(current.slice());
      }

      expect(backward).toHaveLength(factorial(size));
      expect(backward).toEqual(forward.slice().reverse());
      expect(current).toEqual(range(size));
    }
  });

  it("orders objects with a custom comparator", () => {
    const compare = (left: { id: number }, right: { id: number }) =>
      left.id - right.id;
    expect(
      previousPermutation([{ id: 1 }, { id: 3 }, { id: 2 }], { compare }),
    ).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("rejects NaN without a comparator", () => {
    expect(() => previousPermutation([1n, Number.NaN])).toThrow(/NaN/);
    expect(() => previousPermutationInPlace([true, false])).toThrow(/boolean/);
  });

  it("types the immutable result from wrapAround", () => {
    expectTypeOf(previousPermutation([1, 2, 3])).toEqualTypeOf<number[]>();
    expectTypeOf(
      previousPermutation([1, 2, 3], { wrapAround: false }),
    ).toEqualTypeOf<number[] | null>();
  });
});
