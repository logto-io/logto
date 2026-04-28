import crypto from 'node:crypto';

import { UsersPasswordEncryptionMethod } from '@logto/schemas';

import RequestError from '../errors/RequestError/index.js';

import { encryptPassword, executeLegacyHash, parseLegacyPassword } from './password.js';

describe('parseLegacyPassword', () => {
  it('should parse valid legacy password expression', () => {
    const expression = JSON.stringify(['sha256', ['salt123', '@'], 'abcd1234']);
    const result = parseLegacyPassword(expression);
    expect(result).toEqual({
      algorithm: 'sha256',
      args: ['salt123', '@'],
      encryptedPassword: 'abcd1234',
    });
  });

  it('should handle multiple arguments', () => {
    const expression = JSON.stringify(['sha256', ['prefix', '@', 'suffix'], 'abcd1234']);
    const result = parseLegacyPassword(expression);
    expect(result).toEqual({
      algorithm: 'sha256',
      args: ['prefix', '@', 'suffix'],
      encryptedPassword: 'abcd1234',
    });
  });

  it('should throw error for invalid JSON format', () => {
    const expression = 'invalid_json';
    expect(() => parseLegacyPassword(expression)).toThrow(RequestError);
    expect(() => parseLegacyPassword(expression)).toThrow(
      new RequestError({ code: 'password.invalid_legacy_password_format' }).message
    );
  });

  it('should throw error for invalid array structure', () => {
    const expression = JSON.stringify(['sha256', 'not_an_array', 'abcd1234']);
    expect(() => parseLegacyPassword(expression)).toThrow(RequestError);
    expect(() => parseLegacyPassword(expression)).toThrow(
      new RequestError({ code: 'password.invalid_legacy_password_format' }).message
    );
  });

  it('should throw error for unsupported hash algorithm', () => {
    const expression = JSON.stringify(['invalid_algo', ['@'], 'abcd1234']);
    expect(() => parseLegacyPassword(expression)).toThrow(RequestError);
    expect(() => parseLegacyPassword(expression)).toThrow(
      new RequestError({
        code: 'password.unsupported_legacy_hash_algorithm',
        algorithm: 'invalid_algo',
      }).message
    );
  });

  it('should throw error when @ symbol is missing', () => {
    const expression = JSON.stringify(['sha256', ['salt123'], 'abcd1234']);
    expect(() => parseLegacyPassword(expression)).toThrow(RequestError);
    expect(() => parseLegacyPassword(expression)).toThrow(
      new RequestError({ code: 'password.invalid_legacy_password_format' }).message
    );
  });

  it('should throw error for invalid hex: salt in PBKDF2 expression', () => {
    const expression = JSON.stringify(['pbkdf2', ['hex:zz', '1000', '32', 'sha256', '@'], 'hash']);
    expect(() => parseLegacyPassword(expression)).toThrow(
      new RequestError({ code: 'password.invalid_legacy_password_format' })
    );
  });

  it('should accept valid hex: salt in PBKDF2 expression', () => {
    const expression = JSON.stringify([
      'pbkdf2',
      ['hex:80ff00414243', '1000', '32', 'sha256', '@'],
      'hash',
    ]);
    expect(() => parseLegacyPassword(expression)).not.toThrow();
  });

  it('should accept all OpenSSL supported hash algorithms', () => {
    const algorithms = ['md5', 'sha1', 'sha256', 'sha512', 'sha3-256', 'blake2b512'];

    for (const algorithm of algorithms) {
      const expression = JSON.stringify([algorithm, ['salt', '@'], 'abcd1234']);
      expect(() => parseLegacyPassword(expression)).not.toThrow();
    }
  });
});

describe('executeLegacyHash', () => {
  it('should correctly hash with sha256', async () => {
    const parsedExpression = {
      algorithm: 'sha256' as const,
      args: ['salt123', '@'],
      encryptedPassword: 'c465f66c6ac481a7a17e9ed5b4e2e7e7288d892f12bf1c95c140901e9a70436e',
    };
    const inputPassword = 'password123';
    const result = await executeLegacyHash(parsedExpression, inputPassword);
    expect(result).toBe(parsedExpression.encryptedPassword);
  });

  it('should correctly hash with md5', async () => {
    const parsedExpression = {
      algorithm: 'md5' as const,
      args: ['@'],
      encryptedPassword: '51533f457802f105fc615463db7f0e20',
    };
    const inputPassword = 'simple_password';

    const result = await executeLegacyHash(parsedExpression, inputPassword);
    expect(result).toBe(parsedExpression.encryptedPassword);
  });

  it('should handle multiple arguments in correct order', async () => {
    const parsedExpression = {
      algorithm: 'sha1' as const,
      args: ['prefix', '@', 'suffix'],
      encryptedPassword: '1e51b70835fc01a385d43117299e147203d098c6',
    };
    const inputPassword = 'mypass';

    const result = await executeLegacyHash(parsedExpression, inputPassword);
    expect(result).toBe(parsedExpression.encryptedPassword);
  });

  it('should decode hex-encoded PBKDF2 salt with hex: prefix', async () => {
    const inputPassword = 'Password123!';
    const saltHex = '80ff00414243';
    const expectedHash = crypto
      .pbkdf2Sync(inputPassword, Buffer.from(saltHex, 'hex'), 1000, 32, 'sha256')
      .toString('hex');

    const parsedExpression = {
      algorithm: 'pbkdf2' as const,
      args: [`hex:${saltHex}`, '1000', '32', 'sha256', '@'],
      encryptedPassword: expectedHash,
    };

    const result = await executeLegacyHash(parsedExpression, inputPassword);
    expect(result).toBe(expectedHash);
  });

  it('should throw error for invalid hex-encoded PBKDF2 salt', async () => {
    const parsedExpression = {
      algorithm: 'pbkdf2' as const,
      args: ['hex:zz', '1000', '32', 'sha256', '@'],
      encryptedPassword: 'unused',
    };

    await expect(executeLegacyHash(parsedExpression, 'Password123!')).rejects.toThrow(
      new RequestError({ code: 'password.invalid_legacy_password_format' })
    );
  });

  const firebaseScryptExpression = {
    algorithm: 'firebase-scrypt',
    args: [
      '42xEC+ixf3L2lw==', // User salt (base64)
      'jxspr8Ki0RYycVU8zykbdLGjFQ3McFUH0uiiTvC8pVMXAn210wjLNmdZJzxUECKbm0QsEmYUSDzZvpjeJ9WmXA==', // Signer key (base64)
      'Bw==', // Salt separator (base64, 1 byte)
      '8', // Rounds
      '14', // Mem_cost
      '@',
    ],
    encryptedPassword:
      'lSrfV15cpx95/sZS2W9c9Kp6i/LVgQNDNC/qzrCnh1SAyZvqmZqAjTdn3aoItz+VHjoZilo78198JAdRuid5lQ==',
  };

  it('should handle long firebase-scrypt parameters', () => {
    // Longest possible values:
    const scryptMaxLengthExpression = {
      algorithm: 'firebase-scrypt', // 15 chars
      args: [
        '0'.repeat(24), // User salt 16 bytes => 24 in base64
        '0'.repeat(88), // Signer key 64 bytes => 88 in base64
        '0'.repeat(4), // Salt separator 1 byte => 4 in base64
        '0'.repeat(6), // Rounds => 6 chars (0 - 120000)
        '0'.repeat(2), // Mem_cost => 2 chars (1 - 14)
        '@',
      ],
      encryptedPassword: '0'.repeat(88), // 64 bytes => 88 in base64
    };
    const result = parseLegacyPassword(JSON.stringify(Object.values(scryptMaxLengthExpression))); // Total 255 chars!
    expect(result).toEqual(scryptMaxLengthExpression);
  });

  it('should correctly hash with firebase-scrypt', async () => {
    const result = await executeLegacyHash(firebaseScryptExpression, 'user1password');
    expect(result).toBe(firebaseScryptExpression.encryptedPassword);
  });

  it('should reject wrong password with firebase-scrypt', async () => {
    const result = await executeLegacyHash(firebaseScryptExpression, 'wrong-password');
    expect(result).not.toBe(firebaseScryptExpression.encryptedPassword);
  });
});

describe('encryptPassword', () => {
  const unsupportedEncryptionMethod = Object.values(UsersPasswordEncryptionMethod).filter(
    (method) => method !== UsersPasswordEncryptionMethod.Argon2i
  );

  it.each(unsupportedEncryptionMethod)(
    'should throw error for unsupported method %s',
    async (method) => {
      await expect(encryptPassword('password', method)).rejects.toThrow(
        new RequestError({ code: 'password.unsupported_encryption_method', method })
      );
    }
  );

  it('should encrypt password with Argon2i', async () => {
    const password = 'password';
    const result = await encryptPassword(password, UsersPasswordEncryptionMethod.Argon2i);
    expect(result).not.toBe(password);
  });
});
