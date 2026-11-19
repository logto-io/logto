import {
  type CreateWidgetOptions,
  type WidgetHandle,
  type WidgetState,
} from '@friendlycaptcha/sdk';

const createWidgetMock = jest.fn<WidgetHandle, [CreateWidgetOptions]>();
const sdkConstructorMock = jest.fn(() => ({
  createWidget: createWidgetMock,
}));

jest.mock('@friendlycaptcha/sdk', () => ({
  FriendlyCaptchaSDK: sdkConstructorMock,
}));

type WidgetStatus = {
  state: WidgetState;
  response: string;
  isDestroyed: boolean;
};

const createMockWidget = (
  element: HTMLElement,
  initial: Partial<WidgetStatus> = {}
): { widget: WidgetHandle; status: WidgetStatus } => {
  const status: WidgetStatus = {
    state: initial.state ?? 'unactivated',
    response: initial.response ?? '.UNINITIALIZED',
    isDestroyed: initial.isDestroyed ?? false,
  };

  const widget = {
    id: 'w_test',
    startMode: 'focus',
    ready: Promise.resolve(),
    get isDestroyed() {
      return status.isDestroyed;
    },
    getState: jest.fn(() => status.state),
    getResponse: jest.fn(() => status.response),
    getElement: jest.fn(() => element),
    start: jest.fn(),
    reset: jest.fn(() => {
      Reflect.set(status, 'state', 'reset');
      Reflect.set(status, 'response', '.RESET');
    }),
    destroy: jest.fn(() => {
      Reflect.set(status, 'isDestroyed', true);
      Reflect.set(status, 'state', 'destroyed');
      Reflect.set(status, 'response', '.DESTROYED');
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Mirrors real SDK clearing mount target
      element.innerHTML = '';
    }),
    addEventListener: jest.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      element.addEventListener(type, listener);
    }),
    removeEventListener: jest.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      element.removeEventListener(type, listener);
    }),
  } as unknown as WidgetHandle;

  return { widget, status };
};

const flush = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe('friendly-captcha', () => {
  beforeEach(() => {
    jest.resetModules();
    createWidgetMock.mockReset();
    sdkConstructorMock.mockClear();
  });

  it('mounts inside a full-width child element and cleans up on unmount', async () => {
    const container = document.createElement('div');
    const captured: { widget?: WidgetHandle; options?: CreateWidgetOptions } = {};

    createWidgetMock.mockImplementation((options) => {
      const { widget } = createMockWidget(options.element);
      Reflect.set(captured, 'widget', widget);
      Reflect.set(captured, 'options', options);
      return widget;
    });

    const { mountFriendlyCaptchaWidget } = await import('./friendly-captcha');
    const unmount = mountFriendlyCaptchaWidget(container, {
      siteKey: 'FC_TEST_SITEKEY',
      theme: 'dark',
      language: 'de',
      apiEndpoint: 'eu',
    });

    await flush();

    expect(sdkConstructorMock).toHaveBeenCalledTimes(1);
    expect(createWidgetMock).toHaveBeenCalledTimes(1);
    expect(captured.options).toMatchObject({
      sitekey: 'FC_TEST_SITEKEY',
      theme: 'dark',
      language: 'de',
      apiEndpoint: 'eu',
      formFieldName: null,
    });
    expect(captured.options?.element).not.toBe(container);
    expect(captured.options?.element.parentElement).toBe(container);
    expect(captured.options?.element.style.width).toBe('100%');

    unmount();
    await flush();

    expect(captured.widget?.destroy).toHaveBeenCalledTimes(1);
    expect(container.childElementCount).toBe(0);
  });

  it('resolves immediately with an existing completed response and resets asynchronously', async () => {
    const container = document.createElement('div');
    const holder: { widget?: WidgetHandle } = {};

    createWidgetMock.mockImplementation((options) => {
      const { widget } = createMockWidget(options.element, {
        state: 'completed',
        response: 'frc_existing_token',
      });
      Reflect.set(holder, 'widget', widget);
      return widget;
    });

    const { mountFriendlyCaptchaWidget, solveFriendlyCaptchaWidget } = await import(
      './friendly-captcha'
    );
    const unmount = mountFriendlyCaptchaWidget(container, {
      siteKey: 'FC_TEST_SITEKEY',
      theme: 'light',
      language: 'en',
    });

    const token = await solveFriendlyCaptchaWidget(container);

    expect(token).toBe('frc_existing_token');
    expect(holder.widget?.start).not.toHaveBeenCalled();
    expect(holder.widget?.reset).not.toHaveBeenCalled();

    await flush();
    expect(holder.widget?.reset).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('starts an unactivated widget and resolves on frc:widget.complete', async () => {
    const container = document.createElement('div');
    const holder: { widget?: WidgetHandle; element?: HTMLElement } = {};

    createWidgetMock.mockImplementation((options) => {
      const { widget } = createMockWidget(options.element, { state: 'unactivated' });
      Reflect.set(holder, 'widget', widget);
      Reflect.set(holder, 'element', options.element);
      return widget;
    });

    const { mountFriendlyCaptchaWidget, solveFriendlyCaptchaWidget } = await import(
      './friendly-captcha'
    );
    const unmount = mountFriendlyCaptchaWidget(container, {
      siteKey: 'FC_TEST_SITEKEY',
      theme: 'light',
      language: 'en',
    });

    const tokenPromise = solveFriendlyCaptchaWidget(container);
    await flush();

    expect(holder.widget?.start).toHaveBeenCalledTimes(1);

    holder.element?.dispatchEvent(
      new CustomEvent('frc:widget.complete', {
        detail: { name: 'frc:widget.complete', state: 'completed', response: 'frc_token', id: 'w' },
      })
    );

    await expect(tokenPromise).resolves.toBe('frc_token');
    await flush();
    expect(holder.widget?.reset).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('waits without restarting when the widget is already solving', async () => {
    const container = document.createElement('div');
    const holder: { widget?: WidgetHandle; element?: HTMLElement } = {};

    createWidgetMock.mockImplementation((options) => {
      const { widget } = createMockWidget(options.element, { state: 'solving' });
      Reflect.set(holder, 'widget', widget);
      Reflect.set(holder, 'element', options.element);
      return widget;
    });

    const { mountFriendlyCaptchaWidget, solveFriendlyCaptchaWidget } = await import(
      './friendly-captcha'
    );
    const unmount = mountFriendlyCaptchaWidget(container, {
      siteKey: 'FC_TEST_SITEKEY',
      theme: 'light',
      language: 'en',
    });

    const tokenPromise = solveFriendlyCaptchaWidget(container);
    await flush();

    expect(holder.widget?.start).not.toHaveBeenCalled();

    holder.element?.dispatchEvent(
      new CustomEvent('frc:widget.complete', {
        detail: {
          name: 'frc:widget.complete',
          state: 'completed',
          response: 'frc_token_2',
          id: 'w',
        },
      })
    );

    await expect(tokenPromise).resolves.toBe('frc_token_2');
    unmount();
  });

  it.each<WidgetState>(['error', 'expired'])(
    'resets and restarts the widget when its state is %s',
    async (initialState) => {
      const container = document.createElement('div');
      const holder: { widget?: WidgetHandle; element?: HTMLElement } = {};

      createWidgetMock.mockImplementation((options) => {
        const { widget } = createMockWidget(options.element, { state: initialState });
        Reflect.set(holder, 'widget', widget);
        Reflect.set(holder, 'element', options.element);
        return widget;
      });

      const { mountFriendlyCaptchaWidget, solveFriendlyCaptchaWidget } = await import(
        './friendly-captcha'
      );
      const unmount = mountFriendlyCaptchaWidget(container, {
        siteKey: 'FC_TEST_SITEKEY',
        theme: 'light',
        language: 'en',
      });

      const tokenPromise = solveFriendlyCaptchaWidget(container);
      await flush();

      expect(holder.widget?.reset).toHaveBeenCalledTimes(1);
      expect(holder.widget?.start).toHaveBeenCalledTimes(1);

      holder.element?.dispatchEvent(
        new CustomEvent('frc:widget.complete', {
          detail: {
            name: 'frc:widget.complete',
            state: 'completed',
            response: 'frc_recovered_token',
            id: 'w',
          },
        })
      );

      await expect(tokenPromise).resolves.toBe('frc_recovered_token');
      unmount();
    }
  );

  it('rejects with the error detail on frc:widget.error', async () => {
    const container = document.createElement('div');
    const holder: { element?: HTMLElement } = {};

    createWidgetMock.mockImplementation((options) => {
      const { widget } = createMockWidget(options.element, { state: 'unactivated' });
      Reflect.set(holder, 'element', options.element);
      return widget;
    });

    const { mountFriendlyCaptchaWidget, solveFriendlyCaptchaWidget } = await import(
      './friendly-captcha'
    );
    const unmount = mountFriendlyCaptchaWidget(container, {
      siteKey: 'FC_TEST_SITEKEY',
      theme: 'light',
      language: 'en',
    });

    const tokenPromise = solveFriendlyCaptchaWidget(container);
    await flush();

    holder.element?.dispatchEvent(
      new CustomEvent('frc:widget.error', {
        detail: {
          name: 'frc:widget.error',
          state: 'error',
          response: '.ERROR',
          error: { code: 'network_error', detail: 'Request failed' },
          id: 'w',
        },
      })
    );

    await expect(tokenPromise).rejects.toThrow('Friendly Captcha error: Request failed');
    unmount();
  });

  it('rejects an in-flight solve when unmounted', async () => {
    const container = document.createElement('div');

    createWidgetMock.mockImplementation((options) => {
      const { widget } = createMockWidget(options.element, { state: 'solving' });
      return widget;
    });

    const { mountFriendlyCaptchaWidget, solveFriendlyCaptchaWidget } = await import(
      './friendly-captcha'
    );
    const unmount = mountFriendlyCaptchaWidget(container, {
      siteKey: 'FC_TEST_SITEKEY',
      theme: 'light',
      language: 'en',
    });

    const tokenPromise = solveFriendlyCaptchaWidget(container);
    await flush();
    unmount();

    await expect(tokenPromise).rejects.toThrow('Friendly Captcha widget was unmounted');
  });
});
