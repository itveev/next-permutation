import { nextPermutationInPlace, permutations } from "../src/index.js";

function factorial(size: number): number {
  let result = 1;
  for (let value = 2; value <= size; value++) {
    result *= value;
  }
  return result;
}

const values = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const expected = factorial(values.length);

const inPlace = values.slice();
let inPlaceCount = 1;
const inPlaceStart = Date.now();
while (nextPermutationInPlace(inPlace, { wrapAround: false })) {
  inPlaceCount++;
}
const inPlaceMs = Date.now() - inPlaceStart;

let generatedCount = 0;
const generatedStart = Date.now();
for (const _permutation of permutations(values)) {
  generatedCount++;
}
const generatedMs = Date.now() - generatedStart;

console.log(
  `in-place 0..8: ${inPlaceCount} permutations in ${inPlaceMs} ms`,
);
console.log(
  `generator 0..8: ${generatedCount} permutations in ${generatedMs} ms`,
);

if (inPlaceCount !== expected || generatedCount !== expected) {
  throw new Error(`expected ${expected} permutations, got in-place ${inPlaceCount} and generator ${generatedCount}`);
}

function timeWorstCase(length: number, repeats: number): number {
  const worst = new Array<number>(length);
  const start = Date.now();
  for (let repeat = 0; repeat < repeats; repeat++) {
    worst[0] = 0;
    for (let index = 1; index < length; index++) {
      worst[index] = length - index;
    }
    nextPermutationInPlace(worst, { wrapAround: false });
  }
  return Date.now() - start;
}

const repeats = 100;
console.log(
  `in-place ${repeats} full-tail steps on length 20000, including reset: ${timeWorstCase(20_000, repeats)} ms`,
);
console.log(
  `in-place ${repeats} full-tail steps on length 100000, including reset: ${timeWorstCase(100_000, repeats)} ms`,
);
