// xoshiro128++ — fast, high-quality 32-bit PRNG
// https://prng.di.unimi.it/xoshiro128plusplus.c

function rotl(x: number, k: number): number {
  return (x << k) | (x >>> (32 - k))
}

export class RNG {
  private s: Uint32Array

  constructor(seed: number) {
    this.s = new Uint32Array(4)
    // Seed using splitmix32
    let z = (seed >>> 0) + 0x9e3779b9
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    this.s[0] = z ^ (z >>> 16)
    z = (this.s[0] + 0x9e3779b9) >>> 0
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    this.s[1] = z ^ (z >>> 16)
    z = (this.s[1] + 0x9e3779b9) >>> 0
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    this.s[2] = z ^ (z >>> 16)
    z = (this.s[2] + 0x9e3779b9) >>> 0
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    this.s[3] = z ^ (z >>> 16)
  }

  // Returns a random uint32
  private next(): number {
    const result = (rotl((this.s[0] + this.s[3]) >>> 0, 7) + this.s[0]) >>> 0
    const t = (this.s[1] << 9) >>> 0
    this.s[2] ^= this.s[0]
    this.s[3] ^= this.s[1]
    this.s[1] ^= this.s[2]
    this.s[0] ^= this.s[3]
    this.s[2] ^= t
    this.s[3] = rotl(this.s[3], 11)
    return result
  }

  // Returns a float in [0, 1)
  float(): number {
    return this.next() / 0x100000000
  }

  // Returns an integer in [min, max] inclusive
  int(min: number, max: number): number {
    return Math.floor(this.float() * (max - min + 1)) + min
  }

  // Returns a float in [min, max]
  range(min: number, max: number): number {
    return this.float() * (max - min) + min
  }

  // Box-Muller normal distribution with mean=0, sd=1
  normal(): number {
    const u1 = this.float() || 1e-10
    const u2 = this.float()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  // Normal distribution with given mean and standard deviation
  gaussian(mean: number, sd: number): number {
    return this.normal() * sd + mean
  }

  // Returns true with probability p
  chance(p: number): boolean {
    return this.float() < p
  }
}
