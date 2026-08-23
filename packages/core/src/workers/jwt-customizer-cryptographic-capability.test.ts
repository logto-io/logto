import {
  createCustomJwtCryptographicCapability,
  customJwtCryptoMaxInputBytes,
  customJwtCryptoMaxKeyBytes,
} from './jwt-customizer-cryptographic-capability.js';

const crypto = createCustomJwtCryptographicCapability();

const utf8ByteLength = (value: string) => new TextEncoder().encode(value).byteLength;

describe('Custom JWT cryptographic capability', () => {
  describe('sha256', () => {
    it.each([
      // Empty and ASCII known-answer vectors
      ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
      [
        'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
      ],
      // Chinese text
      ['你好', '670d9743542cae3ea7ebe36af56bd53648b0a1126162e78d81a32934a711302e'],
      // Emoji (multi-byte UTF-8)
      ['😀', 'f0443a342c5ef54783a111b51ba56c938e474c32324d90c3a60c9c8e3a37e2d9'],
    ])('hashes %j to the known lowercase hex digest', async (input, expected) => {
      await expect(crypto.sha256(input)).resolves.toBe(expected);
    });

    it('hashes a string containing a NUL byte', async () => {
      await expect(crypto.sha256('a\0b')).resolves.toBe(
        '59b271ae1bbcb1d31d41929817f4b16fb439eb4f31520b5ad1d5ce98920a7138'
      );
    });

    it('replaces a lone surrogate with U+FFFD during UTF-8 encoding', async () => {
      // Lone high surrogate \uD800 → U+FFFD (ef bf bd)
      await expect(crypto.sha256('\uD800')).resolves.toBe(
        '83d544ccc223c057d2bf80d3f2a32982c32c3c0db8e2674820da5064783fb097'
      );
    });

    it('hashes quote, backtick, template and comment syntax literally', async () => {
      // Avoid a literal `${` sequence so eslint does not flag a template expression in a string.
      const templateStart = String.fromCodePoint(0x24, 0x7b);
      const input = `\`"\n${templateStart}foo} // comment /* block */`;

      await expect(crypto.sha256(input)).resolves.toBe(
        '5b673cc9731e754f4b098794fa69658203c727995998ad170b0f207e8b096bb0'
      );
    });

    it('returns exactly 64 lowercase hex characters', async () => {
      const digest = await crypto.sha256('test');

      expect(digest).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
      expect(digest).toMatch(/^[\da-f]{64}$/);
    });

    it('rejects a non-string input with TypeError', async () => {
      await expect((crypto.sha256 as (input: unknown) => Promise<string>)(123)).rejects.toThrow(
        TypeError
      );
    });

    it('rejects input that exceeds the UTF-8 byte limit', async () => {
      const overLimit = 'a'.repeat(customJwtCryptoMaxInputBytes + 1);

      await expect(crypto.sha256(overLimit)).rejects.toThrow(TypeError);
    });

    it('rejects multi-byte input that exceeds the UTF-8 byte limit within the UTF-16 bound', async () => {
      // Each 你 is 1 UTF-16 code unit and 3 UTF-8 bytes.
      const overLimit = '你'.repeat(Math.floor(customJwtCryptoMaxInputBytes / 3) + 1);

      expect(overLimit.length).toBeLessThanOrEqual(customJwtCryptoMaxInputBytes);
      expect(utf8ByteLength(overLimit)).toBeGreaterThan(customJwtCryptoMaxInputBytes);
      await expect(crypto.sha256(overLimit)).rejects.toThrow(TypeError);
    });

    it('accepts input at the exact UTF-8 byte limit', async () => {
      const atLimit = 'a'.repeat(customJwtCryptoMaxInputBytes);

      expect(utf8ByteLength(atLimit)).toBe(customJwtCryptoMaxInputBytes);
      await expect(crypto.sha256(atLimit)).resolves.toMatch(/^[\da-f]{64}$/);
    });
  });

  describe('hmacSha256', () => {
    it('matches RFC 4231 test case 1', async () => {
      await expect(
        crypto.hmacSha256({
          key: '\u000B'.repeat(20),
          input: 'Hi There',
        })
      ).resolves.toBe('b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7');
    });

    it('matches RFC 4231 test case 2', async () => {
      await expect(
        crypto.hmacSha256({
          key: 'Jefe',
          input: 'what do ya want for nothing?',
        })
      ).resolves.toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
    });

    it('accepts an empty message with a non-empty key', async () => {
      await expect(crypto.hmacSha256({ key: 'key', input: '' })).resolves.toBe(
        '5d5d139563c95b5967b9bd9a8c9b233a9dedb45072794cd232dc1b74832607d0'
      );
    });

    it('uses a long HMAC key without changing the public contract', async () => {
      const key = 'a'.repeat(100);

      await expect(crypto.hmacSha256({ key, input: 'message' })).resolves.toBe(
        '5d6dec63ceb9204725536c0672fc6fa66a6043d319a8ea291e1c126e2edfb700'
      );
    });

    it('rejects an empty key', async () => {
      await expect(crypto.hmacSha256({ key: '', input: 'message' })).rejects.toThrow(TypeError);
    });

    it('does not trim the key', async () => {
      const withSpace = await crypto.hmacSha256({ key: ' key', input: 'message' });
      const trimmed = await crypto.hmacSha256({ key: 'key', input: 'message' });

      expect(withSpace).toBe('3f8f002341feb01ee70b1541a4bd108d798b08e00327b2805346463554fbb4b9');
      expect(trimmed).toBe('6e9ef29b75fffc5b7abae527d58fdadb2fe42e7219011976917343065f58ed4a');
      expect(withSpace).not.toBe(trimmed);
    });

    it('rejects a missing options object', async () => {
      await expect(
        // Cast through unknown: runtime must reject a missing options object.
        (crypto.hmacSha256 as (options?: unknown) => Promise<string>)()
      ).rejects.toThrow(TypeError);
    });

    it('rejects non-string key or input', async () => {
      await expect(
        (crypto.hmacSha256 as (options: unknown) => Promise<string>)({ key: 1, input: 'x' })
      ).rejects.toThrow(TypeError);
      await expect(
        (crypto.hmacSha256 as (options: unknown) => Promise<string>)({ key: 'k', input: 1 })
      ).rejects.toThrow(TypeError);
    });

    it('rejects a key that exceeds the UTF-8 byte limit', async () => {
      await expect(
        crypto.hmacSha256({ key: 'a'.repeat(customJwtCryptoMaxKeyBytes + 1), input: 'message' })
      ).rejects.toThrow(TypeError);
    });

    it('accepts a key at the exact UTF-8 byte limit', async () => {
      const key = 'a'.repeat(customJwtCryptoMaxKeyBytes);

      expect(utf8ByteLength(key)).toBe(customJwtCryptoMaxKeyBytes);
      await expect(crypto.hmacSha256({ key, input: 'message' })).resolves.toMatch(/^[\da-f]{64}$/);
    });

    it('rejects input that exceeds the UTF-8 byte limit', async () => {
      await expect(
        crypto.hmacSha256({ key: 'key', input: 'a'.repeat(customJwtCryptoMaxInputBytes + 1) })
      ).rejects.toThrow(TypeError);
    });
  });

  describe('immutability and safe errors', () => {
    it('exposes a frozen capability object', () => {
      expect(Object.isFrozen(crypto)).toBe(true);
    });

    it('does not include input or key material in validation error messages', async () => {
      const secret = 'super-secret-key-material';

      try {
        await crypto.hmacSha256({ key: '', input: 'message' });
        throw new Error('Expected TypeError');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as TypeError).message).not.toContain(secret);
        expect((error as TypeError).message).not.toContain('message');
      }

      try {
        await crypto.hmacSha256({
          key: secret,
          input: 'a'.repeat(customJwtCryptoMaxInputBytes + 1),
        });
        throw new Error('Expected TypeError');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as TypeError).message).not.toContain(secret);
      }
    });
  });
});
