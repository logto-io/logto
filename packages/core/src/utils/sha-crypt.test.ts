import RequestError from '../errors/RequestError/index.js';

import { executeShaCryptHash, isShaCryptAlgorithm, parseShaCryptDigest } from './sha-crypt.js';

const invalidFormatError = new RequestError({ code: 'password.invalid_legacy_password_format' });

/**
 * The `tests2[]` vectors of Ulrich Drepper's specification
 * (https://www.akkadia.org/drepper/SHA-crypt.txt), cross-checked with `openssl passwd -5` / `-6`.
 * The vectors with `rounds=10` are omitted: glibc rewrites the rounds to 1,000 there, while a
 * stored string with out-of-range rounds is rejected at parse time.
 */
const vectors: Array<{
  algorithm: 'sha256-crypt' | 'sha512-crypt';
  password: string;
  hash: string;
}> = [
  {
    algorithm: 'sha256-crypt',
    password: 'Hello world!',
    hash: '$5$saltstring$5B8vYYiY.CVt1RlTTf8KbXBH3hsxY/GNooZaBBGWEc5',
  },
  {
    algorithm: 'sha256-crypt',
    password: 'Hello world!',
    hash: '$5$rounds=10000$saltstringsaltst$3xv.VbSHBb41AL9AvLeujZkZRBAwqFMz2.opqey6IcA',
  },
  {
    algorithm: 'sha256-crypt',
    password: 'This is just a test',
    hash: '$5$rounds=5000$toolongsaltstrin$Un/5jzAHMgOGZ5.mWJpuVolil07guHPvOW8mGRcvxa5',
  },
  {
    algorithm: 'sha256-crypt',
    password:
      'a very much longer text to encrypt.  This one even stretches over morethan one line.',
    hash: '$5$rounds=1400$anotherlongsalts$Rx.j8H.h8HjEDGomFU8bDkXm3XIUnzyxf12oP84Bnq1',
  },
  {
    algorithm: 'sha256-crypt',
    password: 'we have a short salt string but not a short password',
    hash: '$5$rounds=77777$short$JiO1O3ZpDAxGJeaDIuqCoEFysAe1mZNJRs3pw0KQRd/',
  },
  {
    algorithm: 'sha256-crypt',
    password: 'a short string',
    hash: '$5$rounds=123456$asaltof16chars..$gP3VQ/6X7UUEW3HkBn2w1/Ptq2jxPyzV/cZKmF/wJvD',
  },
  {
    algorithm: 'sha512-crypt',
    password: 'Hello world!',
    hash: '$6$saltstring$svn8UoSVapNtMuq1ukKS4tPQd8iKwSMHWjl/O817G3uBnIFNjnQJuesI68u4OTLiBFdcbYEdFCoEOfaS35inz1',
  },
  {
    algorithm: 'sha512-crypt',
    password: 'Hello world!',
    hash: '$6$rounds=10000$saltstringsaltst$OW1/O6BYHV6BcXZu8QVeXbDWra3Oeqh0sbHbbMCVNSnCM/UrjmM0Dp8vOuZeHBy/YTBmSK6H9qs/y3RnOaw5v.',
  },
  {
    algorithm: 'sha512-crypt',
    password: 'This is just a test',
    hash: '$6$rounds=5000$toolongsaltstrin$lQ8jolhgVRVhY4b5pZKaysCLi0QBxGoNeKQzQ3glMhwllF7oGDZxUhx1yxdYcz/e1JSbq3y6JMxxl8audkUEm0',
  },
  {
    algorithm: 'sha512-crypt',
    password:
      'a very much longer text to encrypt.  This one even stretches over morethan one line.',
    hash: '$6$rounds=1400$anotherlongsalts$POfYwTEok97VWcjxIiSOjiykti.o/pQs.wPvMxQ6Fm7I6IoYN3CmLs66x9t0oSwbtEW7o7UmJEiDwGqd8p4ur1',
  },
  {
    algorithm: 'sha512-crypt',
    password: 'we have a short salt string but not a short password',
    hash: '$6$rounds=77777$short$WuQyW2YR.hBNpjjRhpYD/ifIw05xdfeEyQoMxIXbkvr0gge1a1x3yRULJ5CCaUeOxFmtlcGZelFl5CxtgfiAc0',
  },
  {
    algorithm: 'sha512-crypt',
    password: 'a short string',
    hash: '$6$rounds=123456$asaltof16chars..$BtCwjqMJGx5hrJhZywWvt0RLE8uZ4oPwcelCjmw2kSYu.Ec6ycULevoBK25fs2xXgMNrCzIMVcgEJAstJeonj1',
  },
];

describe('isShaCryptAlgorithm', () => {
  it.each([
    ['sha256-crypt', true],
    ['sha512-crypt', true],
    ['sha256', false],
    ['sha512', false],
    ['md5-crypt', false],
    ['toString', false],
  ])('should return %p for %p', (algorithm, expected) => {
    expect(isShaCryptAlgorithm(algorithm)).toBe(expected);
  });
});

describe('parseShaCryptDigest', () => {
  it('should split a stored string into rounds, salt, and checksum', () => {
    expect(
      parseShaCryptDigest(
        'sha512-crypt',
        '$6$rounds=10000$saltstringsaltst$OW1/O6BYHV6BcXZu8QVeXbDWra3Oeqh0sbHbbMCVNSnCM/UrjmM0Dp8vOuZeHBy/YTBmSK6H9qs/y3RnOaw5v.'
      )
    ).toEqual({
      rounds: 10_000,
      salt: 'saltstringsaltst',
      checksum:
        'OW1/O6BYHV6BcXZu8QVeXbDWra3Oeqh0sbHbbMCVNSnCM/UrjmM0Dp8vOuZeHBy/YTBmSK6H9qs/y3RnOaw5v.',
    });
  });

  it('should leave rounds undefined when the stored string has no rounds field', () => {
    expect(
      parseShaCryptDigest(
        'sha256-crypt',
        '$5$saltstring$5B8vYYiY.CVt1RlTTf8KbXBH3hsxY/GNooZaBBGWEc5'
      )
    ).toEqual({
      rounds: undefined,
      salt: 'saltstring',
      checksum: '5B8vYYiY.CVt1RlTTf8KbXBH3hsxY/GNooZaBBGWEc5',
    });
  });

  it.each([
    ['minimum rounds', '$6$rounds=1000$saltstring$' + 'a'.repeat(86), 1000],
    ['maximum rounds', '$6$rounds=1000000$saltstring$' + 'a'.repeat(86), 1_000_000],
  ])('should accept %s', (_, hash, rounds) => {
    expect(parseShaCryptDigest('sha512-crypt', hash)).toMatchObject({ rounds });
  });

  it.each([
    ['any character except `$`', '$6$a b:c*_-!+$', 'a b:c*_-!+'],
    ['UTF-8 characters up to 16 bytes', '$6$' + 'ř'.repeat(8) + '$', 'ř'.repeat(8)],
    ['no characters', '$6$$', ''],
  ])('should accept a salt with %s', (_, head, salt) => {
    expect(parseShaCryptDigest('sha512-crypt', head + 'a'.repeat(86))).toMatchObject({ salt });
  });

  it.each([
    [
      'prefix of the other variant',
      'sha512-crypt',
      '$5$saltstring$5B8vYYiY.CVt1RlTTf8KbXBH3hsxY/GNooZaBBGWEc5',
    ],
    ['unknown prefix', 'sha512-crypt', '$1$saltstring$' + 'a'.repeat(86)],
    ['rounds below the minimum', 'sha512-crypt', '$6$rounds=999$saltstring$' + 'a'.repeat(86)],
    ['rounds above the maximum', 'sha512-crypt', '$6$rounds=1000001$saltstring$' + 'a'.repeat(86)],
    ['salt longer than 16 characters', 'sha512-crypt', '$6$saltstringsaltstring$' + 'a'.repeat(86)],
    // 9 characters, 18 bytes
    ['salt longer than 16 bytes', 'sha512-crypt', '$6$' + 'ř'.repeat(9) + '$' + 'a'.repeat(86)],
    ['rounds with a leading zero', 'sha512-crypt', '$6$rounds=05000$saltstring$' + 'a'.repeat(86)],
    ['rounds with a leading zero and no salt', 'sha512-crypt', '$6$rounds=05000$' + 'a'.repeat(86)],
    ['empty rounds', 'sha512-crypt', '$6$rounds=$saltstring$' + 'a'.repeat(86)],
    ['checksum too short', 'sha512-crypt', '$6$saltstring$' + 'a'.repeat(85)],
    ['checksum too long', 'sha256-crypt', '$5$saltstring$' + 'a'.repeat(44)],
    [
      'checksum with characters outside the alphabet',
      'sha512-crypt',
      '$6$saltstring$' + '='.repeat(86),
    ],
    ['missing checksum', 'sha512-crypt', '$6$saltstring'],
    ['trailing newline', 'sha512-crypt', '$6$saltstring$' + 'a'.repeat(86) + '\n'],
    ['empty string', 'sha512-crypt', ''],
  ])('should reject %s', (_, algorithm, hash) => {
    expect(() => parseShaCryptDigest(algorithm as 'sha256-crypt' | 'sha512-crypt', hash)).toThrow(
      invalidFormatError
    );
  });
});

describe('executeShaCryptHash', () => {
  it.each(vectors)(
    'should reproduce the specification vector $hash',
    async ({ algorithm, password, hash }) => {
      await expect(executeShaCryptHash(algorithm, hash, password)).resolves.toBe(hash);
    }
  );

  it('should produce a different string for a wrong password', async () => {
    const { algorithm, hash } = vectors[6]!;
    await expect(executeShaCryptHash(algorithm, hash, 'Hello world?')).resolves.not.toBe(hash);
  });

  it('should hash non-ASCII passwords as UTF-8 bytes', async () => {
    // `openssl passwd -6 -salt 'rounds=5000$utf8salt' 'Příliš žluťoučký kůň'`
    const hash =
      '$6$rounds=5000$utf8salt$' +
      '69KQ5Jd9dWxva0juAhYMbncv0lRNMPoeLI5mugO3xmShLZpUMUX7HTL2nqzhxdQAHegj9roSNm0WhOs8EgtMw/';
    await expect(executeShaCryptHash('sha512-crypt', hash, 'Příliš žluťoučký kůň')).resolves.toBe(
      hash
    );
  });

  it.each([
    // `openssl passwd -6 -salt 'sa_lt-!' 'Hello world!'`
    [
      'sha512-crypt',
      '$6$sa_lt-!$.mg0slWEK/TZfqsVRKqplNAVxYEqBYI1wrcXao/y9Y7/Hto1RXn82shK5r/SADE8Qh1o5FTTyBwDTk53KwLOA/',
    ],
    // `openssl passwd -6 -salt 'rounds=5000$sälť' 'Hello world!'`
    [
      'sha512-crypt',
      '$6$rounds=5000$sälť$0nGhMOn89y4Jv5SnbkI1CLD.5K6HNcnsWTvW66fzritugE8eBn1zKxWk.igTGlcZHDThgAC4.V12wjp39eGnc.',
    ],
    // `openssl passwd -5 -salt 'a b:c*' 'Hello world!'`
    ['sha256-crypt', '$5$a b:c*$ZaRAttX1eoa3mq8cIBT.LfEezokFDSiJgVSVpLMVjmD'],
  ] as const)('should reproduce %s with an extended salt: %s', async (algorithm, hash) => {
    await expect(executeShaCryptHash(algorithm, hash, 'Hello world!')).resolves.toBe(hash);
  });

  it('should throw for an invalid stored string', async () => {
    await expect(
      executeShaCryptHash('sha512-crypt', '$6$rounds=1$salt$' + 'a'.repeat(86), 'x')
    ).rejects.toThrow(invalidFormatError);
  });
});
