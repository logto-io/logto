import { MfaFactor, MfaPolicy } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';

import { validateMfa } from './mfa.js';

describe('validate mfa', () => {
  describe('pass on valid cases', () => {
    it('should pass on empty factors', () => {
      expect(() => {
        validateMfa({
          factors: [],
          policy: MfaPolicy.UserControlled,
        });
      }).not.toThrow();
    });

    it('should pass on TOTP only', () => {
      expect(() => {
        validateMfa({
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.UserControlled,
        });
      }).not.toThrow();
    });

    it('should pass on TOTP with backup code', () => {
      expect(() => {
        validateMfa({
          factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
          policy: MfaPolicy.UserControlled,
        });
      }).not.toThrow();
    });
  });

  it('should throw on backup code alone', () => {
    expect(() => {
      validateMfa({
        factors: [MfaFactor.BackupCode],
        policy: MfaPolicy.UserControlled,
      });
    }).toMatchError(new RequestError('sign_in_experiences.backup_code_cannot_be_enabled_alone'));
  });

  it('should throw on duplicated factors', () => {
    expect(() => {
      validateMfa({
        factors: [MfaFactor.TOTP, MfaFactor.TOTP],
        policy: MfaPolicy.UserControlled,
      });
    }).toMatchError(new RequestError('sign_in_experiences.duplicated_mfa_factors'));
  });
});
