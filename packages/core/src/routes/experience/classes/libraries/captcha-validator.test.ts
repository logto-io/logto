import { CaptchaType, RecaptchaEnterpriseMode, type CaptchaProvider } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockCaptchaProvider } from '#src/__mocks__/captcha.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const ssrfProtectedFetch = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

mockEsm('#src/utils/outbound-request.js', () => ({ ssrfProtectedFetch }));

const { CaptchaValidator, isScorePass } = await import('./captcha-validator.js');

const capProvider: CaptchaProvider = {
  ...mockCaptchaProvider,
  config: {
    type: CaptchaType.Cap,
    endpoint: 'https://cap.example.com/',
    siteKey: 'site_key',
    secretKey: 'secret_key',
  },
};

const geetestProvider: CaptchaProvider = {
  ...mockCaptchaProvider,
  config: {
    type: CaptchaType.Geetest,
    siteKey: 'captcha_id',
    secretKey: 'secret_key',
  },
};

const geetestToken = JSON.stringify({
  lot_number: 'lot_number',
  captcha_output: 'captcha_output',
  pass_token: 'pass_token',
  gen_time: 'gen_time',
});

const createLog = () => {
  const append = jest.fn();

  return { log: { append } as unknown as LogEntry, append };
};

describe('CaptchaValidator - Cap', () => {
  afterEach(() => {
    ssrfProtectedFetch.mockReset();
  });

  it('verifies the token against the Cap siteverify endpoint', async () => {
    ssrfProtectedFetch.mockResolvedValueOnce(Response.json({ success: true }));
    const { log, append } = createLog();

    await expect(new CaptchaValidator(capProvider, log).verifyCaptcha('token')).resolves.toBe(true);

    const [request] = ssrfProtectedFetch.mock.calls[0] ?? [];
    expect(request).toBeInstanceOf(Request);

    const { url, method } = request as Request;
    expect(url).toBe('https://cap.example.com/site_key/siteverify');
    expect(method).toBe('POST');

    await expect((request as Request).json()).resolves.toEqual({
      secret: 'secret_key',
      response: 'token',
    });
    expect(append).toHaveBeenCalledWith({ success: true, errorMessage: undefined });
  });

  it('returns false with the Cap error when the token is rejected', async () => {
    ssrfProtectedFetch.mockResolvedValueOnce(
      Response.json({ success: false, error: 'Token not found' }, { status: 404 })
    );
    const { log, append } = createLog();

    await expect(new CaptchaValidator(capProvider, log).verifyCaptcha('token')).resolves.toBe(
      false
    );
    expect(append).toHaveBeenCalledWith({ success: false, errorMessage: 'Token not found' });
  });

  it('returns false when the Cap instance is unreachable', async () => {
    ssrfProtectedFetch.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));
    const { log, append } = createLog();

    await expect(new CaptchaValidator(capProvider, log).verifyCaptcha('token')).resolves.toBe(
      false
    );
    expect(append).toHaveBeenCalledWith({
      success: false,
      errorMessage: 'Failed to get the result from Cap',
    });
  });
});

describe('CaptchaValidator - GeeTest', () => {
  afterEach(() => {
    ssrfProtectedFetch.mockReset();
  });

  it('verifies the token against the GeeTest validation API', async () => {
    ssrfProtectedFetch.mockResolvedValueOnce(Response.json({ result: 'success', reason: '' }));
    const { log, append } = createLog();

    await expect(
      new CaptchaValidator(geetestProvider, log).verifyCaptcha(geetestToken)
    ).resolves.toBe(true);

    const [request] = ssrfProtectedFetch.mock.calls[0] ?? [];
    expect(request).toBeInstanceOf(Request);

    const { url, method, headers } = request as Request;
    expect(url).toBe('https://gcaptcha4.geetest.com/validate?captcha_id=captcha_id');
    expect(method).toBe('POST');
    expect(headers.get('content-type')).toBe('application/x-www-form-urlencoded');

    const body = new URLSearchParams(await (request as Request).text());
    expect(Object.fromEntries(body)).toEqual({
      lot_number: 'lot_number',
      captcha_output: 'captcha_output',
      pass_token: 'pass_token',
      gen_time: 'gen_time',
      // HMAC-SHA256 of `lot_number` with `secret_key`
      sign_token: 'af1b473c6e891450430936b5bb3f555a374e9a0d5b20d1d301598d39d166a7ad',
    });
    expect(append).toHaveBeenCalledWith({ success: true, errorMessage: undefined });
  });

  it('returns false with the GeeTest reason when the token is rejected', async () => {
    ssrfProtectedFetch.mockResolvedValueOnce(
      Response.json({ result: 'fail', reason: 'pass_token expire' })
    );
    const { log, append } = createLog();

    await expect(
      new CaptchaValidator(geetestProvider, log).verifyCaptcha(geetestToken)
    ).resolves.toBe(false);
    expect(append).toHaveBeenCalledWith({ success: false, errorMessage: 'pass_token expire' });
  });

  it('returns false when the token is not valid JSON', async () => {
    const { log, append } = createLog();

    await expect(new CaptchaValidator(geetestProvider, log).verifyCaptcha('token')).resolves.toBe(
      false
    );
    expect(ssrfProtectedFetch).not.toHaveBeenCalled();
    expect(append).toHaveBeenCalledWith({
      success: false,
      errorMessage: 'Failed to get the result from GeeTest',
    });
  });

  it('returns false when the GeeTest API is unreachable', async () => {
    ssrfProtectedFetch.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));
    const { log, append } = createLog();

    await expect(
      new CaptchaValidator(geetestProvider, log).verifyCaptcha(geetestToken)
    ).resolves.toBe(false);
    expect(append).toHaveBeenCalledWith({
      success: false,
      errorMessage: 'Failed to get the result from GeeTest',
    });
  });
});

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
