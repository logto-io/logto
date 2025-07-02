import crypto from 'node:crypto';

import { type TokenSet } from '@logto/schemas';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import {
  encryptTokens,
  decryptTokens,
  serializeEncryptedSecret,
  deserializeEncryptedSecret,
} from './secret-encryption.js';

describe('secret encryption', () => {
  const mockKek = crypto.randomBytes(32).toString('base64');

  it('should successfully encrypt and decrypt token', () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      secretVaultKek: mockKek,
    });

    const mockToken: TokenSet = {
      access_token: crypto.randomBytes(32).toString('hex'),
      refresh_token: crypto.randomBytes(32).toString('hex'),
    };

    const encryptedSecret = encryptTokens(mockToken);
    const decryptedSecret = decryptTokens(encryptedSecret);

    expect(decryptedSecret).toEqual(mockToken);

    stub.restore();
  });

  it('should successfully serialize and deserialize encrypted secret', () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      secretVaultKek: mockKek,
    });

    const mockToken: TokenSet = {
      access_token: crypto.randomBytes(32).toString('hex'),
      refresh_token: crypto.randomBytes(32).toString('hex'),
    };

    const encryptedSecret = encryptTokens(mockToken);
    const serialized = serializeEncryptedSecret(encryptedSecret);
    const deserialized = deserializeEncryptedSecret(serialized);
    const decryptedSecret = decryptTokens(deserialized);

    expect(decryptedSecret).toEqual(mockToken);

    stub.restore();
  });
});
