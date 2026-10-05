import { describe, expect, expectTypeOf, it } from "vitest";
import { nextPermutation, nextPermutationInPlace } from "../src/index.js";

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

function isStrictlyBefore(
  left: readonly number[],
  right: readonly number[],
): boolean {
  for (let index = 0; index < left.length; index++) {
    if (left[index] < right[index]) {
      return true;
    }
    if (left[index] > right[index]) {
      return false;
    }
  }
  return false;
}

describe("nextPermutation", () => {
  it("returns the next lexicographic permutation", () => {
    expect(nextPermutation([1, 2, 3])).toEqual([1, 3, 2]);
    expect(nextPermutation([1, 3, 2])).toEqual([2, 1, 3]);
    expect(nextPermutation([3, 1, 2])).toEqual([3, 2, 1]);
  });

  it("wraps the last permutation to the first and reports that via in-place", () => {
    const values = [3, 2, 1];
    expect(nextPermutationInPlace(values)).toBe(false);
    expect(values).toEqual([1, 2, 3]);
    expect(nextPermutation([3, 2, 1])).toEqual([1, 2, 3]);
  });

  it("leaves the array unchanged and returns null when wrapAround is false", () => {
    const values = [3, 2, 1];
    expect(nextPermutationInPlace(values, { wrapAround: false })).toBe(false);
    expect(values).toEqual([3, 2, 1]);
    expect(nextPermutation([3, 2, 1], { wrapAround: false })).toBeNull();
    expect(nextPermutation([1, 2, 3], { wrapAround: false })).toEqual([1, 3, 2]);
  });

  it("does not mutate the input from the immutable API", () => {
    const values = [1, 3, 2];
    const result = nextPermutation(values);
    expect(values).toEqual([1, 3, 2]);
    expect(result).toEqual([2, 1, 3]);
    expect(result).not.toBe(values);
  });

  it("mutates the same array from the in-place API", () => {
    const values = [1, 2, 3];
    expect(nextPermutationInPlace(values)).toBe(true);
    expect(values).toEqual([1, 3, 2]);
  });

  it("treats empty, singleton, and equal elements as a single permutation", () => {
    for (const values of [[], [1], [7, 7, 7]] as number[][]) {
      const wrapped = values.slice();
      expect(nextPermutationInPlace(wrapped)).toBe(false);
      expect(wrapped).toEqual(values);

      const held = values.slice();
      expect(nextPermutationInPlace(held, { wrapAround: false })).toBe(false);
      expect(held).toEqual(values);

      const immutable = nextPermutation(values);
      expect(immutable).toEqual(values);
      expect(immutable).not.toBe(values);
      expect(nextPermutation(values, { wrapAround: false })).toBeNull();
    }
  });

  it("orders number, string, and bigint with the default comparator", () => {
    expect(nextPermutation([1, 3, 2])).toEqual([2, 1, 3]);
    expect(nextPermutation(["a", "c", "b"])).toEqual(["b", "a", "c"]);
    expect(nextPermutation(["b", "a"])).toEqual(["a", "b"]);
    expect(nextPermutation(["A", "a"])).toEqual(["a", "A"]);
    expect(nextPermutation([1n, 3n, 2n])).toEqual([2n, 1n, 3n]);
  });

  it("orders objects only through a custom comparator and keeps element identity", () => {
    const first = { id: 1, name: "a" };
    const second = { id: 2, name: "b" };
    const users = [first, second];
    const compare = (left: { id: number }, right: { id: number }) =>
      left.id - right.id;
    const result = nextPermutation(users, { compare });

    expect(users).toEqual([first, second]);
    expect(result).toEqual([second, first]);
    expect(result?.[0]).toBe(second);
    expect(result?.[1]).toBe(first);
  });

  it("walks every unique permutation of 0..n-1 in order", () => {
    for (let size = 0; size <= 8; size++) {
      const start = range(size);
      const seen: number[][] = [];
      const current = start.slice();
      seen.push(current.slice());
      while (nextPermutationInPlace(current, { wrapAround: false })) {
        seen.push(current.slice());
      }

      expect(seen).toHaveLength(factorial(size));
      expect(seen[0]).toEqual(start);
      expect(seen[seen.length - 1]).toEqual(start.slice().reverse());
      expect(
        seen.every(
          (values, index) =>
            index === 0 || isStrictlyBefore(seen[index - 1] ?? [], values),
        ),
      ).toBe(true);
      expect(current).toEqual(start.slice().reverse());
    }
  });

  it("rejects values the default comparator cannot order", () => {
    expect(() => nextPermutation([1, Number.NaN, 2])).toThrow(TypeError);
    expect(() => nextPermutation([1, Number.NaN, 2])).toThrow(/NaN/);
    expect(() => nextPermutation([1, "2", 3])).toThrow(/mixed types/);
    expect(() => nextPermutation([1, 2n])).toThrow(/mixed types/);
    expect(() => nextPermutation([{ id: 1 }])).toThrow(/object/);
    expect(() => nextPermutation([true, false])).toThrow(/boolean/);
    expect(() => nextPermutation([new Date(), new Date()])).toThrow(/Date/);
    expect(() => nextPermutation([Symbol("a")])).toThrow(/symbol/);
    expect(() => nextPermutation([null] as unknown as number[])).toThrow(/null/);
    expect(() => nextPermutation("abc" as unknown as number[])).toThrow(
      /array/i,
    );
  });

  it("rejects sparse arrays even when a comparator is provided", () => {
    const values = [1, 2, 3];
    delete values[1];
    const compare = (left: number, right: number) => left - right;
    expect(() => nextPermutation(values)).toThrow(/Sparse arrays/);
    expect(() => nextPermutation(values, { compare })).toThrow(/Sparse arrays/);
    expect(() => nextPermutationInPlace(values, { compare })).toThrow(
      /Sparse arrays/,
    );
    expect(values[0]).toBe(1);
    expect(values[2]).toBe(3);
  });

  it("types the immutable result from wrapAround", () => {
    expectTypeOf(nextPermutation([1, 2, 3])).toEqualTypeOf<number[]>();
    expectTypeOf(
      nextPermutation([1, 2, 3], { wrapAround: true }),
    ).toEqualTypeOf<number[]>();
    expectTypeOf(
      nextPermutation([1, 2, 3], { wrapAround: false }),
    ).toEqualTypeOf<number[] | null>();

    const options: { wrapAround?: boolean } = {};
    expectTypeOf(nextPermutation([1, 2, 3], options)).toEqualTypeOf<
      number[] | null
    >();
  });
});

describe("repeated values", () => {
  it("counts distinct permutations of a multiset", () => {
    const values = [0, 0, 1, 1, 2];
    const seen: number[][] = [values.slice()];
    const current = values.slice();
    while (nextPermutationInPlace(current, { wrapAround: false })) {
      seen.push(current.slice());
    }

    expect(seen).toHaveLength(factorial(5) / (factorial(2) * factorial(2)));
    expect(seen[0]).toEqual([0, 0, 1, 1, 2]);
    expect(seen[seen.length - 1]).toEqual([2, 1, 1, 0, 0]);
    expect(
      seen.every(
        (permutation, index) =>
          index === 0 || isStrictlyBefore(seen[index - 1] ?? [], permutation),
      ),
    ).toBe(true);
  });
});
