import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto';

import {
  MfaFactor,
  type MfaVerificationWebAuthn,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assert } from '@silverhand/essentials';

import { logtoUrl } from '#src/constants.js';

/** The flags of an assertion made with user presence (`UP`) and user verification (`UV`). */
const userPresentAndVerifiedFlags = 0x05;

/**
 * CBOR-encode an ES256 (P-256) public key, given its base64url JWK coordinates, as the COSE_Key
 * WebAuthn stores for a credential.
 */
const encodeCosePublicKey = (xCoordinate: string, yCoordinate: string) =>
  Buffer.concat([
    // Map of 5 entries: kty = EC2, alg = ES256, crv = P-256, then the 32-byte x and y
    Buffer.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01]),
    Buffer.from([0x21, 0x58, 0x20]),
    Buffer.from(xCoordinate, 'base64url'),
    Buffer.from([0x22, 0x58, 0x20]),
    Buffer.from(yCoordinate, 'base64url'),
  ]);

/**
 * A software authenticator holding one user-verifying ES256 passkey for the Logto instance under
 * test, so the API tests can complete a real WebAuthn assertion without a browser. The relying
 * party is the host the tests call, which is what Logto takes as the expected RP ID and origin.
 */
export class VirtualPasskey {
  readonly credentialId = randomBytes(16).toString('base64url');
  readonly #keyPair = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  #signCount = 0;

  /** The credential as Logto stores it in `users.mfa_verifications`. */
  get mfaVerification(): MfaVerificationWebAuthn {
    const { x: xCoordinate, y: yCoordinate } = this.#keyPair.publicKey.export({ format: 'jwk' });
    assert(xCoordinate && yCoordinate, new Error('The generated key has no public coordinates'));

    return {
      id: generateStandardId(),
      type: MfaFactor.WebAuthn,
      createdAt: new Date().toISOString(),
      rpId: new URL(logtoUrl).hostname,
      credentialId: this.credentialId,
      publicKey: encodeCosePublicKey(xCoordinate, yCoordinate).toString('base64url'),
      transports: ['internal'],
      counter: 0,
      agent: 'integration-test',
    };
  }

  /** Answer an authentication challenge with a user-verified assertion. */
  assert(challenge: string): WebAuthnVerificationPayload {
    const { origin, hostname } = new URL(logtoUrl);
    const clientDataJSON = Buffer.from(
      JSON.stringify({ type: 'webauthn.get', challenge, origin, crossOrigin: false })
    );
    const signCount = Buffer.alloc(4);
    this.#signCount += 1;
    signCount.writeUInt32BE(this.#signCount);
    const authenticatorData = Buffer.concat([
      createHash('sha256').update(hostname).digest(),
      Buffer.from([userPresentAndVerifiedFlags]),
      signCount,
    ]);
    const signature = sign(
      'sha256',
      Buffer.concat([authenticatorData, createHash('sha256').update(clientDataJSON).digest()]),
      this.#keyPair.privateKey
    );

    return {
      type: MfaFactor.WebAuthn,
      id: this.credentialId,
      rawId: this.credentialId,
      response: {
        clientDataJSON: clientDataJSON.toString('base64url'),
        authenticatorData: authenticatorData.toString('base64url'),
        signature: signature.toString('base64url'),
      },
      clientExtensionResults: {},
    };
  }
}
