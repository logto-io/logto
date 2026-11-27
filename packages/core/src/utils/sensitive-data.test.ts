import { sanitizeSensitiveDataRecord } from './sensitive-data.js';

describe('sanitizeSensitiveDataRecord', () => {
  it('uses one canonical policy for omitted, masked, and explicitly safe fields', () => {
    const nul = String.fromCodePoint(0);

    expect(
      sanitizeSensitiveDataRecord({
        javaScript: 'private script',
        scriptResult: 'private script result',
        environmentVariablesBackup: { TOKEN: 'private environment value' },
        [`pass${nul}word`]: 'private password',
        hasPassword: true,
        passwordVerified: 'private password status',
        applicationSecret: { name: 'rotation-2' },
        unsafeApplicationSecret: { name: 'rotation-2', value: 'private application secret' },
        note: `safe${nul}value`,
      })
    ).toEqual({
      password: '******',
      hasPassword: true,
      passwordVerified: '******',
      applicationSecret: { name: 'rotation-2' },
      unsafeApplicationSecret: '******',
      note: 'safevalue',
    });
  });

  it('masks MFA backup codes and keeps other codes readable', () => {
    expect(
      sanitizeSensitiveDataRecord({
        verification: { type: 'BackupCode', backupCodes: ['a1b2c3d4e5'] },
        bindMfa: { type: 'BackupCode', codes: ['a1b2c3d4e5'] },
        customData: { codes: ['promo-1'] },
        error: { code: 'session.mfa.invalid_backup_code' },
      })
    ).toEqual({
      verification: { type: 'BackupCode', backupCodes: '******' },
      bindMfa: { type: 'BackupCode', codes: '******' },
      customData: { codes: ['promo-1'] },
      error: { code: 'session.mfa.invalid_backup_code' },
    });
  });
});
