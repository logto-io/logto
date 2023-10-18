import { generateBackupCodes } from './backup-code-validation.js';

describe('generateBackupCodes()', () => {
  it('should generate a group of random backup codes', () => {
    const codes = generateBackupCodes();
    expect(codes.length).toEqual(10);
    for (const code of codes) {
      expect(code.length).toEqual(10);
      expect(code).toMatch(/[\da-f]{10}/);
    }
  });
});
