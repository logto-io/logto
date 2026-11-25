import {
  type FRCWidgetCompleteEvent,
  type FRCWidgetWidgetErrorEvent,
  type FriendlyCaptchaSDK,
  type WidgetHandle,
} from '@friendlycaptcha/sdk';

type MountOptions = {
  siteKey: string;
  theme: 'light' | 'dark';
  language: string;
  apiEndpoint?: string;
};

type PendingSolve = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
  cleanup: () => void;
};

const widgetGetters = new WeakMap<HTMLElement, () => Promise<WidgetHandle>>();
const pendingSolves = new WeakMap<HTMLElement, PendingSolve>();

/** Check that a Friendly Captcha response is an actual token rather than a `.`-prefixed sentinel. */
const isValidResponse = (value: string) => Boolean(value) && !value.startsWith('.');

// eslint-disable-next-line @silverhand/fp/no-let -- Memoizes the single SDK instance promise per page
let sdkLoader: Promise<FriendlyCaptchaSDK> | undefined;

/**
 * Lazily import `@friendlycaptcha/sdk` and return the shared `FriendlyCaptchaSDK` instance.
 * Creating multiple SDK instances logs warnings and duplicates background agent iframes.
 */
export const loadFriendlyCaptchaSdk = async () => {
  if (sdkLoader === undefined) {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Memoizes the single SDK instance promise per page
    sdkLoader = (async () => {
      try {
        const { FriendlyCaptchaSDK } = await import('@friendlycaptcha/sdk');
        return new FriendlyCaptchaSDK();
      } catch (error: unknown) {
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears failed load so later attempts can retry
        sdkLoader = undefined;
        throw error;
      }
    })();
  }

  return sdkLoader;
};

const settlePendingSolve = (container: HTMLElement): PendingSolve | undefined => {
  const pending = pendingSolves.get(container);
  if (pending) {
    pendingSolves.delete(container);
    pending.cleanup();
  }
  return pending;
};

/**
 * Mount a Friendly Captcha v2 widget inside `container` and return a cleanup function.
 * A child `<div>` is created for the SDK because `widget.destroy()` clears its target's
 * `innerHTML` and inline styles.
 */
export const mountFriendlyCaptchaWidget = (
  container: HTMLElement,
  { siteKey, theme, language, apiEndpoint }: MountOptions
): (() => void) => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Tracks unmount during async SDK loading
  let isCancelled = false;

  const mountElement = document.createElement('div');
  // Friendly Captcha defaults width to 316px only when inline width is empty.
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Presets full width before SDK initialization
  mountElement.style.width = '100%';
  container.append(mountElement);

  const createWidget = async () => {
    const sdk = await loadFriendlyCaptchaSdk();
    if (isCancelled) {
      throw new Error('Friendly Captcha widget was unmounted');
    }

    return sdk.createWidget({
      element: mountElement,
      sitekey: siteKey,
      theme,
      language,
      apiEndpoint,
      formFieldName: null,
    });
  };

  // eslint-disable-next-line @silverhand/fp/no-let -- Memoizes the widget until creation fails
  let widgetPromise: Promise<WidgetHandle> | undefined;

  /** Return the widget, creating it again if an earlier attempt failed. */
  const getWidget = async () => {
    if (widgetPromise === undefined) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Memoizes the widget until creation fails
      widgetPromise = (async () => {
        try {
          return await createWidget();
        } catch (error: unknown) {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- Clears failed creation so the next solve can retry
          widgetPromise = undefined;
          throw error;
        }
      })();
    }

    return widgetPromise;
  };

  widgetGetters.set(container, getWidget);

  // Create the widget eagerly, and prevent unhandled rejection if it fails before solving runs.
  void (async () => {
    try {
      await getWidget();
    } catch {
      // Errors are surfaced when solving, which retries the creation.
    }
  })();

  return () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Marks widget unmounted before async mount resolves
    isCancelled = true;

    if (widgetGetters.get(container) === getWidget) {
      widgetGetters.delete(container);
    }

    const pending = settlePendingSolve(container);
    pending?.reject(new Error('Friendly Captcha widget was unmounted'));

    const currentWidgetPromise = widgetPromise;

    void (async () => {
      try {
        const widget = await currentWidgetPromise;
        if (widget && !widget.isDestroyed) {
          widget.destroy();
        }
      } catch {
        // Widget failed to mount; nothing to destroy.
      } finally {
        mountElement.remove();
      }
    })();
  };
};

/**
 * Obtain a single-use token from the Friendly Captcha widget mounted in `container`.
 * Schedules an asynchronous `reset()` after taking a token since tokens are single-use.
 */
export const solveFriendlyCaptchaWidget = async (container: HTMLElement): Promise<string> => {
  const getWidget = widgetGetters.get(container);

  if (!getWidget) {
    throw new Error('Friendly Captcha widget is not rendered');
  }

  const widget = await getWidget();

  if (widget.isDestroyed) {
    throw new Error('Friendly Captcha widget is destroyed');
  }

  const takeToken = (token: string, resolve: (value: string) => void) => {
    // Defer reset so the widget finishes dispatching its completion event first.
    setTimeout(() => {
      if (!widget.isDestroyed) {
        widget.reset();
      }
    }, 0);
    resolve(token);
  };

  if (widget.getState() === 'completed') {
    const existingResponse = widget.getResponse();

    if (isValidResponse(existingResponse)) {
      return new Promise<string>((resolve) => {
        takeToken(existingResponse, resolve);
      });
    }
  }

  return new Promise<string>((resolve, reject) => {
    const previous = settlePendingSolve(container);
    previous?.reject(new Error('Friendly Captcha verification was superseded'));

    const cleanup = () => {
      widget.removeEventListener('frc:widget.complete', onComplete);
      widget.removeEventListener('frc:widget.error', onError);
    };

    function onComplete(event: FRCWidgetCompleteEvent) {
      const pending = settlePendingSolve(container);
      if (!pending) {
        return;
      }

      const { response } = event.detail;

      if (isValidResponse(response)) {
        takeToken(response, pending.resolve);
      } else {
        pending.reject(new Error('Friendly Captcha widget is solved without a token'));
      }
    }

    function onError(event: FRCWidgetWidgetErrorEvent) {
      const pending = settlePendingSolve(container);
      if (!pending) {
        return;
      }

      const { detail, code } = event.detail.error;
      const message = detail.length > 0 ? detail : code;
      pending.reject(new Error(`Friendly Captcha error: ${message}`));
    }

    pendingSolves.set(container, { resolve, reject, cleanup });
    widget.addEventListener('frc:widget.complete', onComplete);
    widget.addEventListener('frc:widget.error', onError);

    const state = widget.getState();

    if (state === 'error' || state === 'expired') {
      widget.reset();
      widget.start();
    } else if (state === 'init' || state === 'reset' || state === 'unactivated') {
      widget.start();
    }
  });
};
