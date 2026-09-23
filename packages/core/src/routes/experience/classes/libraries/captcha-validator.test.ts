import { CaptchaType, type CaptchaProvider } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockCaptchaProvider } from '#src/__mocks__/captcha.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const ssrfProtectedFetch = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

mockEsm('#src/utils/outbound-request.js', () => ({ ssrfProtectedFetch }));

const { CaptchaValidator } = await import('./captcha-validator.js');

const capProvider: CaptchaProvider = {
  ...mockCaptchaProvider,
  config: {
    type: CaptchaType.Cap,
    endpoint: 'https://cap.example.com/',
    siteKey: 'site_key',
    secretKey: 'secret_key',
  },
};

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
