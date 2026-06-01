import { isTrustedPreviewMessage, previewMessageSender } from './preview-message';

const createMessageEvent = (
  data: unknown,
  options?: { source?: MessageEventSource | null; origin?: string }
): MessageEvent =>
  ({
    data,
    source: options?.source ?? null,
    origin: options?.origin ?? 'https://console.example.com',
  }) as MessageEvent;

describe('isTrustedPreviewMessage', () => {
  const originalParent = window.parent;

  afterEach(() => {
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: originalParent,
    });
  });

  it('accepts a message from the direct parent frame', () => {
    const parent = {} as Window;
    Object.defineProperty(window, 'parent', { configurable: true, value: parent });

    expect(
      isTrustedPreviewMessage(
        createMessageEvent({ sender: previewMessageSender, config: {} }, { source: parent })
      )
    ).toBe(true);
  });

  it('rejects messages when not embedded in a parent frame', () => {
    Object.defineProperty(window, 'parent', { configurable: true, value: window });

    expect(
      isTrustedPreviewMessage(
        createMessageEvent({ sender: previewMessageSender, config: {} }, { source: window })
      )
    ).toBe(false);
  });

  it('rejects messages from a non-parent window', () => {
    const parent = {} as Window;
    const otherWindow = {} as Window;
    Object.defineProperty(window, 'parent', { configurable: true, value: parent });

    expect(
      isTrustedPreviewMessage(
        createMessageEvent({ sender: previewMessageSender, config: {} }, { source: otherWindow })
      )
    ).toBe(false);
  });

  it('rejects messages with an unexpected sender', () => {
    const parent = {} as Window;
    Object.defineProperty(window, 'parent', { configurable: true, value: parent });

    expect(
      isTrustedPreviewMessage(
        createMessageEvent({ sender: 'other', config: {} }, { source: parent })
      )
    ).toBe(false);
  });

  it('rejects non-object message data', () => {
    const parent = {} as Window;
    Object.defineProperty(window, 'parent', { configurable: true, value: parent });

    expect(isTrustedPreviewMessage(createMessageEvent('1', { source: parent }))).toBe(false);
  });
});
