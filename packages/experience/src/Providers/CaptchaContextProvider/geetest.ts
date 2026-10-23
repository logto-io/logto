const geetestScriptId = 'geetest-script';
const geetestScriptUrl = 'https://static.geetest.com/v4/gt4.js';

/**
 * Map Logto language tags to the language codes supported by GeeTest CAPTCHA v4. Unsupported
 * locales fall back to English, which is also GeeTest's default.
 *
 * @see https://docs.geetest.com/BehaviorVerification/apirefer/api/web#language
 */
const geetestLanguages: Readonly<Record<string, string>> = {
  ar: 'ara',
  de: 'deu',
  en: 'eng',
  es: 'spa',
  fr: 'fra',
  ja: 'jpn',
  ko: 'kor',
  'pt-BR': 'pon',
  'pt-PT': 'por',
  ru: 'rus',
  'zh-CN': 'zho',
  'zh-HK': 'zho-hk',
  'zh-TW': 'zho-tw',
};

export const getGeetestLanguage = (language: string) => geetestLanguages[language] ?? 'eng';

const hasErrorMessage = (error: unknown): error is { msg?: unknown } =>
  typeof error === 'object' && error !== null;

const getErrorMessage = (error: unknown) => {
  if (!hasErrorMessage(error)) {
    return 'Unknown error';
  }

  const { msg } = error;
  return typeof msg === 'string' ? msg : 'Unknown error';
};

/** Load the GeeTest v4 SDK once. */
// eslint-disable-next-line @silverhand/fp/no-let -- Memoizes the single script loading promise
let scriptLoader: Promise<void> | undefined;

const loadScript = async () => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Memoizes the single script loading promise
  scriptLoader ??= new Promise<void>((resolve, reject) => {
    if (window.initGeetest4) {
      resolve();
      return;
    }

    const handleError = (script?: HTMLScriptElement) => {
      script?.remove();
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Allows retrying after a failed load
      scriptLoader = undefined;
      reject(new Error('Failed to load GeeTest CAPTCHA'));
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`#${geetestScriptId}`);

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve();
      });
      existingScript.addEventListener('error', () => {
        handleError(existingScript);
      });
      return;
    }

    const script = document.createElement('script');
    /* eslint-disable @silverhand/fp/no-mutation */
    script.id = geetestScriptId;
    script.src = geetestScriptUrl;
    script.async = true;
    /* eslint-enable @silverhand/fp/no-mutation */
    script.addEventListener('load', () => {
      resolve();
    });
    script.addEventListener('error', () => {
      handleError(script);
    });
    document.body.append(script);
  });

  return scriptLoader;
};

type PendingSolve = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

type GeetestInstance = {
  captchaId: string;
  language: string;
  instance: Promise<GeetestCaptcha>;
};

// eslint-disable-next-line @silverhand/fp/no-let -- There is only one GeeTest instance per page
let geetestInstance: GeetestInstance | undefined;
// eslint-disable-next-line @silverhand/fp/no-let -- Tracks the submission waiting for the CAPTCHA
let pendingSolve: PendingSolve | undefined;

const destroyGeetest = async (target?: GeetestInstance) => {
  if (!target) {
    return;
  }

  try {
    const instance = await target.instance;
    instance.destroy();
  } catch {
    // The previous instance failed to initialize, so there is nothing to clean up
  }
};

const clearFailedInstance = async (instance: Promise<GeetestCaptcha>) => {
  try {
    await instance;
  } catch {
    if (geetestInstance?.instance === instance) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Allows retrying after a failed init
      geetestInstance = undefined;
    }
  }
};

const initialize = async (captchaId: string, language: string) => {
  await loadScript();

  const { initGeetest4 } = window;

  if (!initGeetest4) {
    throw new Error('GeeTest CAPTCHA is not available');
  }

  return new Promise<GeetestCaptcha>((resolve, reject) => {
    const handleError = (error: unknown) => {
      const message = `GeeTest CAPTCHA error: ${getErrorMessage(error)}`;

      if (pendingSolve) {
        pendingSolve.reject(new Error(message));
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears the failed submission
        pendingSolve = undefined;
        return;
      }

      reject(new Error(message));
    };

    initGeetest4(
      { captchaId, product: 'bind', language, protocol: 'https://', onError: handleError },
      (instance) => {
        instance
          .onReady(() => {
            resolve(instance);
          })
          .onSuccess(() => {
            if (!pendingSolve) {
              return;
            }

            const validate = instance.getValidate();

            if (!validate) {
              pendingSolve.reject(
                new Error('GeeTest CAPTCHA is solved without a validation result')
              );
              // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears the settled submission
              pendingSolve = undefined;
              return;
            }

            pendingSolve.resolve(JSON.stringify(validate));
            // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears the settled submission
            pendingSolve = undefined;
          })
          .onError(handleError)
          .onClose(() => {
            if (!pendingSolve) {
              return;
            }

            pendingSolve.reject(new Error('GeeTest CAPTCHA was closed'));
            // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears the cancelled submission
            pendingSolve = undefined;
          });
      }
    );
  });
};

/**
 * Initialize the GeeTest CAPTCHA in `bind` mode, where the challenge is only shown when
 * `showCaptcha()` is called. The instance is re-created when the CAPTCHA ID or language changes so
 * the challenge UI matches the current locale.
 */
export const loadGeetest = async (captchaId: string, language: string) => {
  const geetestLanguage = getGeetestLanguage(language);

  if (geetestInstance?.captchaId === captchaId && geetestInstance.language === geetestLanguage) {
    return geetestInstance.instance;
  }

  pendingSolve?.reject(new Error('GeeTest CAPTCHA was reinitialized'));

  const previousInstance = geetestInstance;
  const instance = initialize(captchaId, geetestLanguage);

  // eslint-disable-next-line @silverhand/fp/no-mutation -- Replaces the single page instance
  geetestInstance = { captchaId, language: geetestLanguage, instance };
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Drops the superseded submission
  pendingSolve = undefined;

  void destroyGeetest(previousInstance);
  void clearFailedInstance(instance);

  return instance;
};

/**
 * Show the GeeTest challenge and resolve with the validation result as a JSON string. The public
 * `captchaToken` is a single string, while GeeTest returns four fields; encoding them here keeps
 * the API contract unchanged.
 */
export const executeGeetest = async (captchaId: string, language: string) => {
  const instance = await loadGeetest(captchaId, language);

  return new Promise<string>((resolve, reject) => {
    pendingSolve?.reject(new Error('GeeTest CAPTCHA was superseded'));
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Tracks the submission waiting for the CAPTCHA
    pendingSolve = { resolve, reject };

    try {
      instance.showCaptcha();
    } catch (error: unknown) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears the failed submission
      pendingSolve = undefined;
      reject(error instanceof Error ? error : new Error('GeeTest CAPTCHA failed to show'));
    }
  });
};
