import { getGeetestLanguage } from './geetest';

type GeetestInit = NonNullable<typeof window.initGeetest4>;

type GeetestHandlers = {
  ready?: () => void;
  success?: () => void;
  error?: (error: unknown) => void;
  close?: () => void;
};

const validate = {
  lot_number: 'lot_number',
  captcha_output: 'captcha_output',
  pass_token: 'pass_token',
  gen_time: 'gen_time',
};

const createCaptcha = () => {
  const handlers: GeetestHandlers = {};
  const captcha: GeetestCaptcha = {
    onReady: jest.fn((callback) => {
      Reflect.set(handlers, 'ready', callback);
      return captcha;
    }),
    onSuccess: jest.fn((callback) => {
      Reflect.set(handlers, 'success', callback);
      return captcha;
    }),
    onError: jest.fn((callback) => {
      Reflect.set(handlers, 'error', callback);
      return captcha;
    }),
    onClose: jest.fn((callback) => {
      Reflect.set(handlers, 'close', callback);
      return captcha;
    }),
    showCaptcha: jest.fn(),
    getValidate: jest.fn(() => validate),
    reset: jest.fn(),
    destroy: jest.fn(),
  };

  return { captcha, handlers };
};

const flush = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const mockSdk = (captcha: GeetestCaptcha) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Test double for the GeeTest SDK
  window.initGeetest4 = jest.fn((_config, callback) => {
    callback(captcha);
  });
};

describe('getGeetestLanguage', () => {
  it('maps supported locales and falls back to English', () => {
    expect(getGeetestLanguage('zh-CN')).toBe('zho');
    expect(getGeetestLanguage('zh-HK')).toBe('zho-hk');
    expect(getGeetestLanguage('zh-TW')).toBe('zho-tw');
    expect(getGeetestLanguage('pt-BR')).toBe('pon');
    expect(getGeetestLanguage('pt-PT')).toBe('por');
    expect(getGeetestLanguage('en')).toBe('eng');
    expect(getGeetestLanguage('pl-PL')).toBe('eng');
  });
});

describe('executeGeetest', () => {
  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Test double for the GeeTest SDK
    window.initGeetest4 = undefined;
  });

  it('initializes in bind mode and resolves the validation result as a JSON string', async () => {
    const { captcha, handlers } = createCaptcha();
    const initGeetest4 = jest.fn<ReturnType<GeetestInit>, Parameters<GeetestInit>>(
      (_config, callback) => {
        callback(captcha);
      }
    );
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Test double for the GeeTest SDK
    window.initGeetest4 = initGeetest4;

    const { executeGeetest } = await import('./geetest');
    const tokenPromise = executeGeetest('captcha_id', 'zh-CN');

    await flush();

    const [config] = initGeetest4.mock.calls[0] ?? [];

    if (!config) {
      throw new Error('GeeTest init was not called');
    }

    expect(config).toMatchObject({
      captchaId: 'captcha_id',
      product: 'bind',
      language: 'zho',
      protocol: 'https://',
    });
    expect(config.onError).toBeInstanceOf(Function);

    handlers.ready?.();
    await flush();

    expect(captcha.showCaptcha).toHaveBeenCalled();

    handlers.success?.();

    await expect(tokenPromise).resolves.toBe(JSON.stringify(validate));
  });

  it('rejects when initialization fails before the SDK callback', async () => {
    const initGeetest4 = jest.fn((config: { onError?: (error: unknown) => void }) => {
      config.onError?.({ msg: 'network error' });
    });
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Test double for the GeeTest SDK
    window.initGeetest4 = initGeetest4;

    const { executeGeetest } = await import('./geetest');

    await expect(executeGeetest('captcha_id', 'en')).rejects.toThrow(
      'GeeTest CAPTCHA error: network error'
    );
  });

  it('retries initialization after a failed preload', async () => {
    const { captcha, handlers } = createCaptcha();
    const initGeetest4 = jest.fn(
      (
        config: { onError?: (error: unknown) => void },
        callback: (captcha: GeetestCaptcha) => void
      ) => {
        if (initGeetest4.mock.calls.length === 1) {
          config.onError?.({ msg: 'network error' });
          return;
        }

        callback(captcha);
      }
    );
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Test double for the GeeTest SDK
    window.initGeetest4 = initGeetest4;

    const { executeGeetest } = await import('./geetest');

    await expect(executeGeetest('captcha_id', 'en')).rejects.toThrow(
      'GeeTest CAPTCHA error: network error'
    );
    await flush();

    const tokenPromise = executeGeetest('captcha_id', 'en');

    await flush();
    handlers.ready?.();
    await flush();
    handlers.success?.();

    await expect(tokenPromise).resolves.toBe(JSON.stringify(validate));
    expect(initGeetest4).toHaveBeenCalledTimes(2);
  });

  it('rejects when the CAPTCHA is closed', async () => {
    const { captcha, handlers } = createCaptcha();
    mockSdk(captcha);

    const { executeGeetest } = await import('./geetest');
    const tokenPromise = executeGeetest('captcha_id', 'en');

    await flush();
    handlers.ready?.();
    await flush();
    handlers.close?.();

    await expect(tokenPromise).rejects.toThrow('GeeTest CAPTCHA was closed');
  });

  it('rejects with the SDK error message when the challenge fails', async () => {
    const { captcha, handlers } = createCaptcha();
    mockSdk(captcha);

    const { executeGeetest } = await import('./geetest');
    const tokenPromise = executeGeetest('captcha_id', 'en');

    await flush();
    handlers.ready?.();
    await flush();
    handlers.error?.({ msg: 'network error' });

    await expect(tokenPromise).rejects.toThrow('GeeTest CAPTCHA error: network error');
  });
});
