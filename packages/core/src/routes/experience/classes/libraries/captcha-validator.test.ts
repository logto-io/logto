import { RecaptchaEnterpriseMode } from '@logto/schemas';

import { isScorePass } from './captcha-validator.js';

describe('isScorePass', () => {
  it('passes when the score meets the default threshold in invisible mode', () => {
    expect(isScorePass({ valid: true, score: 0.5, mode: RecaptchaEnterpriseMode.Invisible })).toBe(
      true
    );
    expect(isScorePass({ valid: true, score: 0.49, mode: RecaptchaEnterpriseMode.Invisible })).toBe(
      false
    );
  });

  it('falls back to the default threshold when no threshold is configured', () => {
    expect(isScorePass({ valid: true, score: 0.5 })).toBe(true);
    expect(isScorePass({ valid: true, score: 0.49 })).toBe(false);
  });

  it('uses the configured score threshold when provided', () => {
    expect(
      isScorePass({
        valid: true,
        score: 0.8,
        mode: RecaptchaEnterpriseMode.Invisible,
        scoreThreshold: 0.8,
      })
    ).toBe(true);
    expect(
      isScorePass({
        valid: true,
        score: 0.79,
        mode: RecaptchaEnterpriseMode.Invisible,
        scoreThreshold: 0.8,
      })
    ).toBe(false);
  });

  it('ignores the score threshold in checkbox mode and only checks validity', () => {
    expect(isScorePass({ valid: true, score: 0, mode: RecaptchaEnterpriseMode.Checkbox })).toBe(
      true
    );
    expect(
      isScorePass({
        valid: true,
        score: 1,
        mode: RecaptchaEnterpriseMode.Checkbox,
        scoreThreshold: 1,
      })
    ).toBe(true);
    expect(isScorePass({ valid: false, score: 1, mode: RecaptchaEnterpriseMode.Checkbox })).toBe(
      false
    );
  });

  it('fails when the token is invalid', () => {
    expect(isScorePass({ valid: false, score: 1, mode: RecaptchaEnterpriseMode.Invisible })).toBe(
      false
    );
  });
});
