/* tslint:disable:no-bitwise */

/**
 * Generates a rolling hashing object that can be used to create hashes of a
 * sliding window of values as defined by the Rabin-Karp string matching
 * algorithm.
 */
export class RollingHash {
  /**
   * The modulus used in the hash calculation.
   *
   * Since we want to be able to take the product of two hashes, the product of
   * two hashes, the modulus multiplied by itself should not have more than the
   * available amount of bits of precision.
   *
   * Javascript has 53-bit precision numbers (doubles) so we pick the largest
   * prime number with 26 bits.
   */
  readonly mod: number = 33554393;

  /**
   * The base (or radix) used in the hash calculation.
   *
   * The hashes/numbers generated by TokenHash should already use as much
   * bits as possible because they share the same modulus.
   *
   * We have chosen for the largest prime with 22 bits.
   */
  readonly base: number = 4194301;

  /**
   * The size of the window/length of this rolling hash.
   */
  readonly k: number;

  private readonly memory: number[];
  private readonly maxBase: number;
  private i = 0;
  private hash = 0;

  /**
   * Creates and initializes a new RollingHash instance.
   *
   * @param k The size of the window/length of which the hashes are calculated.
   */
  constructor(k: number) {
    this.k = k;
    this.maxBase = this.mod - this.modPow(this.base, this.k, this.mod);
    this.memory = new Array(this.k).fill(0);
  }

  /**
   * Calculates a new hashing based on the previous hashing, and the new token value
   *
   * @param token the next token value.
   */
  public nextHash(token: number): number {
    this.hash = (this.base * this.hash + token + this.maxBase * this.memory[this.i])  % this.mod;
    this.memory[this.i] = token;
    this.i = (this.i + 1) % this.k;
    return this.hash;
  }

  /**
   * Modular exponentiation without overflowing.
   * Code based on the pseudocode at
   * https://en.wikipedia.org/wiki/Modular_exponentiation#Pseudocode
   *
   * @param base the base
   * @param exp the exponent
   * @param mod the modulus
   */
  private modPow(base: number, exp: number, mod: number): number {
    let y = 1;
    let b = base;
    let e = exp;
    while (e > 1) {
      if (e & 1) {
        y = (b * y) % mod;
      }
      b = (b * b) % mod;
      e >>= 1;
    }
    return (b * y) % mod;
  }
}
