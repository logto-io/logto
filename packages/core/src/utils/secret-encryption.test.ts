import crypto from 'node:crypto';

import { type TokenRecord } from '@logto/schemas';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import { encryptTokens, decryptTokens } from './secret-encryption.js';

describe('secrety encryption', () => {
  const mockKek = crypto.randomBytes(32).toString('base64');

  it('should successfully encrypt and decrypt token', () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      secretVaultKek: mockKek,
    });

    const mockToken: TokenRecord = {
      accessToken: crypto.randomBytes(32).toString('hex'),
      refreshToken: crypto.randomBytes(32).toString('hex'),
    };

    const encryptedSecret = encryptTokens(mockToken);
    const decryptedSecret = decryptTokens(encryptedSecret);

    expect(decryptedSecret).toEqual(mockToken);

    stub.restore();
  });
});
