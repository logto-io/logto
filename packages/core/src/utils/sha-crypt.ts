import crypto from 'node:crypto';

import RequestError from '#src/errors/RequestError/index.js';

/**
 * SHA-crypt password hashing, the `$5$` (SHA-256) and `$6$` (SHA-512) schemes of glibc `crypt(3)`.
 *
 * Produced by Linux `/etc/shadow`, `openssl passwd -5|-6`, Python `passlib`, PHP `crypt()`, and
 * many Rust/Go libraries, so it is a common source format when migrating users into Logto.
 *
 * Implemented from Ulrich Drepper's specification, including its test vectors. `node:crypto`
 * has no SHA-crypt, so the construction is done here with plain `createHash` calls.
 * @see https://www.akkadia.org/drepper/SHA-crypt.txt
 *
 * Legacy expression: `["sha512-crypt", ["@"], "$6$rounds=5000$salt$checksum"]` (same with
 * `sha256-crypt` and `$5$`). The third element is the complete crypt string as the source
 * system stored it; `rounds` and `salt` are read from it, the hash is recomputed with the typed
 * password, and the whole string is compared.
 *
 * The spec allows up to 999,999,999 rounds. Since the hash runs on the main thread, the accepted
 * range is capped at 1,000,000 to bound event-loop blocking while still covering the passlib
 * defaults of 656,000 (`sha512-crypt`) and 535,000 (`sha256-crypt`). A stored value outside the
 * accepted range is rejected at user creation, as is a `rounds` field glibc never writes (leading
 * zero).
 *
 * The salt may contain any character except `$`, as glibc, PHP `crypt()`, and `openssl passwd`
 * accept, and is limited to 16 bytes (UTF-8), the length glibc truncates it to.
 */

type ShaCryptAlgorithm = 'sha256-crypt' | 'sha512-crypt';

const roundsMin = 1000;
const roundsMax = 1_000_000;
const roundsDefault = 5000;
const saltMaxBytes = 16;
const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

type Variant = {
  prefix: string;
  digest: 'sha256' | 'sha512';
  checksumLength: number;
  /**
   * Output byte order of the spec's base64 step: each entry is `[b2, b1, b0, chars]`, the three
   * digest bytes that form one 24-bit group (undefined means a zero byte) and how many characters
   * to emit for it.
   */
  groups: Array<[number | undefined, number | undefined, number, number]>;
};

const variants: Record<ShaCryptAlgorithm, Variant> = {
  'sha256-crypt': {
    prefix: '$5$',
    digest: 'sha256',
    checksumLength: 43,
    groups: [
      [0, 10, 20, 4],
      [21, 1, 11, 4],
      [12, 22, 2, 4],
      [3, 13, 23, 4],
      [24, 4, 14, 4],
      [15, 25, 5, 4],
      [6, 16, 26, 4],
      [27, 7, 17, 4],
      [18, 28, 8, 4],
      [9, 19, 29, 4],
      [undefined, 31, 30, 3],
    ],
  },
  'sha512-crypt': {
    prefix: '$6$',
    digest: 'sha512',
    checksumLength: 86,
    groups: [
      [0, 21, 42, 4],
      [22, 43, 1, 4],
      [44, 2, 23, 4],
      [3, 24, 45, 4],
      [25, 46, 4, 4],
      [47, 5, 26, 4],
      [6, 27, 48, 4],
      [28, 49, 7, 4],
      [50, 8, 29, 4],
      [9, 30, 51, 4],
      [31, 52, 10, 4],
      [53, 11, 32, 4],
      [12, 33, 54, 4],
      [34, 55, 13, 4],
      [56, 14, 35, 4],
      [15, 36, 57, 4],
      [37, 58, 16, 4],
      [59, 17, 38, 4],
      [18, 39, 60, 4],
      [40, 61, 19, 4],
      [62, 20, 41, 4],
      [undefined, undefined, 63, 2],
    ],
  },
};

export const isShaCryptAlgorithm = (algorithm: string): algorithm is ShaCryptAlgorithm =>
  Object.hasOwn(variants, algorithm);

type ParsedShaCryptDigest = {
  /** The `rounds=` value when the stored string has one, otherwise `undefined` (5,000 is used). */
  rounds?: number;
  salt: string;
  checksum: string;
};

const invalidFormat = () => new RequestError({ code: 'password.invalid_legacy_password_format' });

/**
 * Validate a stored SHA-crypt string against the given algorithm and split it into its fields.
 * Throws `password.invalid_legacy_password_format` when the prefix does not match the algorithm,
 * the rounds are outside the accepted range or have a leading zero, the salt is longer than 16
 * bytes, or the checksum has the wrong length or alphabet.
 */
export const parseShaCryptDigest = (
  algorithm: ShaCryptAlgorithm,
  encryptedPassword: string
): ParsedShaCryptDigest => {
  const { prefix, checksumLength } = variants[algorithm];

  if (!encryptedPassword.startsWith(prefix)) {
    throw invalidFormat();
  }

  // A leading `rounds=<digits>$` is always the rounds field in glibc, so the salt never starts with
  // one; the lookahead keeps a malformed rounds field (e.g. `rounds=05000$`) from passing as salt.
  // `(?![\s\S])` rejects a trailing line terminator, which `$` alone would accept.
  const match =
    /^(?:rounds=([1-9]\d{0,8})\$)?(?!rounds=\d*\$)([^$]*)\$([\d./A-Za-z]+)$(?![\S\s])/.exec(
      encryptedPassword.slice(prefix.length)
    );

  if (!match) {
    throw invalidFormat();
  }

  const [, roundsString, salt, checksum] = match;

  if (
    salt === undefined ||
    Buffer.byteLength(salt, 'utf8') > saltMaxBytes ||
    checksum === undefined ||
    checksum.length !== checksumLength
  ) {
    throw invalidFormat();
  }

  const rounds = roundsString === undefined ? undefined : Number.parseInt(roundsString, 10);

  if (rounds !== undefined && (rounds < roundsMin || rounds > roundsMax)) {
    throw invalidFormat();
  }

  return { rounds, salt, checksum };
};

/** Fill `length` bytes by repeating `block`. */
const repeatTo = (block: Uint8Array, length: number): Uint8Array =>
  length === 0
    ? new Uint8Array(0)
    : Buffer.concat(Array.from({ length: Math.ceil(length / block.length) }, () => block)).subarray(
        0,
        length
      );

/** The spec's custom base64: 6 bits per character, least significant bits first, no padding. */
const encode = (digest: Uint8Array, groups: Variant['groups']): string => {
  const byte = (index?: number) => (index === undefined ? 0 : (digest[index] ?? 0));

  return groups
    .map(([b2, b1, b0, chars]) => {
      // Arithmetic instead of shifts keeps the code free of bitwise operators.
      const value = byte(b2) * 65_536 + byte(b1) * 256 + byte(b0);

      return Array.from({ length: chars }, (_, position) =>
        itoa64.charAt(Math.floor(value / 64 ** position) % 64)
      ).join('');
    })
    .join('');
};

const shaCrypt = (
  variant: Variant,
  password: Uint8Array,
  salt: Uint8Array,
  rounds: number
): Uint8Array => {
  const { digest } = variant;
  const hash = (...parts: Uint8Array[]) =>
    parts.reduce((hasher, part) => hasher.update(part), crypto.createHash(digest)).digest();

  // Steps 4-8: digest B = H(password, salt, password)
  const digestB = hash(password, salt, password);

  // Steps 1-3, 9-12: digest A = H(password, salt, B cycled to the password length, then for
  // every bit of the password length from the lowest up: B when the bit is set, else the password)
  const bitCount = password.length === 0 ? 0 : password.length.toString(2).length;
  const digestA = hash(
    password,
    salt,
    repeatTo(digestB, password.length),
    ...Array.from({ length: bitCount }, (_, bit) =>
      Math.floor(password.length / 2 ** bit) % 2 === 1 ? digestB : password
    )
  );

  // Steps 13-16: digest DP and the byte sequence P
  const digestDp = hash(...Array.from({ length: password.length }, () => password));
  const sequenceP = repeatTo(digestDp, password.length);

  // Steps 17-20: digest DS and the byte sequence S
  const digestDs = hash(...Array.from({ length: 16 + (digestA[0] ?? 0) }, () => salt));
  const sequenceS = repeatTo(digestDs, salt.length);

  // Step 21: the rounds. A plain loop: `rounds` may be large, so no array of that length is built.
  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation -- SHA-crypt's rounds loop is inherently stateful and may run up to 1,000,000 iterations. */
  let digestC = digestA;
  for (let round = 0; round < rounds; round += 1) {
    digestC = hash(
      round % 2 === 1 ? sequenceP : digestC,
      ...(round % 3 === 0 ? [] : [sequenceS]),
      ...(round % 7 === 0 ? [] : [sequenceP]),
      round % 2 === 1 ? digestC : sequenceP
    );
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

  return digestC;
};

/**
 * Compute the complete SHA-crypt string for `inputPassword` using the prefix, rounds, and salt of
 * the stored `encryptedPassword`. Verification succeeds when the result equals the stored string.
 */
export const executeShaCryptHash = async (
  algorithm: ShaCryptAlgorithm,
  encryptedPassword: string,
  inputPassword: string
): Promise<string> => {
  const variant = variants[algorithm];
  const { rounds, salt } = parseShaCryptDigest(algorithm, encryptedPassword);
  const digest = shaCrypt(
    variant,
    Buffer.from(inputPassword, 'utf8'),
    Buffer.from(salt, 'utf8'),
    rounds ?? roundsDefault
  );
  const roundsField = rounds === undefined ? '' : `rounds=${rounds}$`;

  return `${variant.prefix}${roundsField}${salt}$${encode(digest, variant.groups)}`;
};
