import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationProofRole,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { BackupCodeVerification } from '../verifications/backup-code-verification.js';
import { PasswordVerification } from '../verifications/password-verification.js';
import { SocialVerification } from '../verifications/social-verification.js';
import { TotpVerification } from '../verifications/totp-verification.js';
import { WebAuthnVerification } from '../verifications/web-authn-verification.js';

import { AuthenticationProofs } from './authentication-proofs.js';

const { libraries, queries } = new MockTenant();
const { Create, Identify, Bind, Mfa } = AuthenticationProofRole;

const password = new PasswordVerification(libraries, queries, {
  id: 'password',
  type: VerificationType.Password,
  identifier: { type: SignInIdentifier.Username, value: 'foo' },
  verified: true,
});

const totp = new TotpVerification(libraries, queries, {
  id: 'totp',
  type: VerificationType.TOTP,
  userId: mockUser.id,
  verified: true,
});

const backupCode = new BackupCodeVerification(libraries, queries, {
  id: 'backup-code',
  type: VerificationType.BackupCode,
  userId: mockUser.id,
  code: 'code',
});

const webAuthn = new WebAuthnVerification(libraries, queries, {
  id: 'web-authn',
  type: VerificationType.WebAuthn,
  userId: mockUser.id,
  verified: true,
});

const social = new SocialVerification(libraries, queries, {
  id: 'social',
  type: VerificationType.Social,
  connectorId: 'connector',
  socialUserInfo: { id: 'social-user' },
});

describe('AuthenticationProofs', () => {
  it('records the factor, class and AMR values of a record', () => {
    const proofs = new AuthenticationProofs();

    proofs.stage(password, Identify);
    proofs.stage(totp, Mfa);
    proofs.stage(webAuthn, Bind);
    proofs.stage(social, Create);

    expect(proofs.proofs).toEqual([
      {
        id: 'password',
        factor: AuthenticationFactor.Password,
        class: AuthenticationFactorClass.FirstFactor,
        amr: ['pwd'],
        role: Identify,
      },
      {
        id: 'totp',
        factor: AuthenticationFactor.Totp,
        class: AuthenticationFactorClass.Mfa,
        amr: ['otp'],
        role: Mfa,
      },
      {
        id: 'web-authn',
        factor: AuthenticationFactor.WebAuthn,
        class: AuthenticationFactorClass.Both,
        amr: ['pop', 'user', 'mfa'],
        role: Bind,
      },
      {
        id: 'social',
        factor: AuthenticationFactor.Federated,
        class: undefined,
        amr: ['fed'],
        role: Create,
      },
    ]);
  });

  it('keys proofs by record and role, so a retry overwrites and a second role is kept', () => {
    const proofs = new AuthenticationProofs();

    proofs.stage(password, Identify);
    proofs.stage(password, Identify);
    expect(proofs.proofs).toHaveLength(1);

    proofs.stage(password, Bind);
    expect(proofs.proofs.map(({ role }) => role)).toEqual([Identify, Bind]);
  });

  it('records a backup code challenge but not a backup code bind', () => {
    const proofs = new AuthenticationProofs();

    proofs.stage(backupCode, Bind);
    expect(proofs.proofs).toEqual([]);

    proofs.stage(backupCode, Mfa);
    expect(proofs.proofs).toMatchObject([{ id: 'backup-code', role: Mfa }]);
  });

  it('records a password established through the profile', () => {
    const proofs = new AuthenticationProofs();

    proofs.stageEstablishedPassword();

    expect(proofs.proofs).toMatchObject([
      {
        id: 'password',
        factor: AuthenticationFactor.Password,
        class: AuthenticationFactorClass.FirstFactor,
        amr: ['pwd'],
        role: Bind,
      },
    ]);
  });

  it('round-trips through its data and can be cleared', () => {
    const proofs = new AuthenticationProofs();
    proofs.stage(password, Identify);
    proofs.stage(totp, Mfa);

    const restored = new AuthenticationProofs(proofs.data);
    expect(restored.proofs).toEqual(proofs.proofs);

    restored.clear();
    expect(restored.proofs).toEqual([]);
    expect(restored.data).toEqual([]);
  });
});
