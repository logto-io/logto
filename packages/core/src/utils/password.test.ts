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
