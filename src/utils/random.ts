export const hashSeed = (seed: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const createRng = (seed: string): (() => number) => {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomBetween = (rng: () => number, min: number, max: number) => min + (max - min) * rng();

export const randomInt = (rng: () => number, min: number, max: number) =>
  Math.floor(randomBetween(rng, min, max + 1));

export const weightedPick = <T extends { weight: number }>(rng: () => number, values: T[]): T => {
  const total = values.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const value of values) {
    roll -= value.weight;
    if (roll <= 0) {
      return value;
    }
  }
  return values[values.length - 1];
};
