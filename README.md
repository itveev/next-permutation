# next-permutation-js

[![npm version](https://img.shields.io/npm/v/next-permutation-js)](https://www.npmjs.com/package/next-permutation-js)
[![npm downloads](https://img.shields.io/npm/dm/next-permutation-js)](https://www.npmjs.com/package/next-permutation-js)

Minimal, dependency-free lexicographic permutations for JavaScript.

`nextPermutation` and `previousPermutation` move one step. `permutations` lazily yields every distinct permutation in order. In-place steps are O(n) time and O(1) extra memory.

## Install

```sh
npm install npm install next-permutation-js
```

## Usage

```ts
import {
  nextPermutation,
  nextPermutationInPlace,
  previousPermutation,
  permutations,
} from "next-permutation-js";

nextPermutation([1, 2, 3]);
// [1, 3, 2]

previousPermutation([1, 3, 2]);
// [1, 2, 3]

[...permutations([1, 2, 3])];
// [1, 2, 3]
// [1, 3, 2]
// [2, 1, 3]
// [2, 3, 1]
// [3, 1, 2]
// [3, 2, 1]
```

## Next and previous

```ts
const values = [1, 2, 3];

nextPermutationInPlace(values);
// true, values is now [1, 3, 2]

previousPermutationInPlace(values);
// true, values is back to [1, 2, 3]
```

The boolean result means a strictly later or earlier permutation existed. It does not mean the array changed.

## Immutable and in-place

Immutable functions copy the input and return a new array. They never modify the array you pass in.

```ts
const values = [1, 3, 2];
nextPermutation(values); // [2, 1, 3]
// values is still [1, 3, 2]
```

In-place functions modify the same array. Copies are shallow: a new array can still hold the original element objects.

## wrapAround

`wrapAround` defaults to `true`, matching `std::next_permutation`.

The last permutation wraps to the first. The in-place function still returns `false`:

```ts
const values = [3, 2, 1];
nextPermutationInPlace(values); // false
// values is [1, 2, 3]

nextPermutation([3, 2, 1]); // [1, 2, 3]
```

The first permutation wraps to the last with `previousPermutation`.

With `wrapAround: false`, the boundary does not change the array. The immutable call returns `null`:

```ts
const values = [3, 2, 1];
nextPermutationInPlace(values, { wrapAround: false }); // false
// values is still [3, 2, 1]

nextPermutation([3, 2, 1], { wrapAround: false }); // null
```

An empty array, a single element, or an array of equal elements has only one permutation. Wrapping leaves the contents in place. The immutable call still returns that array when `wrapAround` is left on, and `null` when it is `false`.

## Custom comparator

`compare` uses the `Array.sort` contract: negative, zero, or positive. Elements are equivalent when `compare(a, b) === 0`.

Without `compare`, only `number`, `string`, and `bigint` are ordered, and every element must be the same one of those types. Strings use UTF-16 order (`<` / `>`), not `localeCompare`. `NaN`, mixed types, and other values throw `TypeError`.

```ts
nextPermutation(users, {
  compare: (a, b) => a.id - b.id,
});
```

A custom comparator is used as given. Sparse arrays are rejected either way.

## Permutations

`permutations` returns a generator. It does not build the full sequence up front, and it does not modify the input. Generation always starts at the minimum permutation for the comparator, whatever order the input had.

```ts
for (const permutation of permutations([3, 1, 2])) {
  console.log(permutation);
}
```

Each yield is a new array. Equivalent elements do not produce duplicate permutations:

```ts
[...permutations([1, 1, 2])];
// [1, 1, 2]
// [1, 2, 1]
// [2, 1, 1]

[...permutations([])]; // [[]]
[...permutations([1])]; // [[1]]
```

`permutations` does not take `wrapAround`.

## Complexity

One in-place step finds a pivot, swaps it with a successor or predecessor, and reverses the tail. It does not sort that tail.

| Operation | Time | Extra memory |
| --- | --- | --- |
| `nextPermutationInPlace`, `previousPermutationInPlace` | O(n) | O(1) |
| `nextPermutation`, `previousPermutation` | O(n) | O(n) for the returned copy |
| `permutations` | O(n log n) to reach the first permutation, then O(n) per yield | O(n) for the cursor, plus one array per yield |

## Mutation

| Function | Input array | Result |
| --- | --- | --- |
| `nextPermutationInPlace`, `previousPermutationInPlace` | Modified | `true` if a strict neighbor existed, otherwise `false` |
| `nextPermutation`, `previousPermutation` | Unchanged | The next array, or `null` only when `wrapAround` is `false` and there is no neighbor |
| `permutations` | Unchanged | Independent arrays, one per distinct permutation |

## License

MIT
