import { signInExperiencePreviewMessageSender } from '@logto/schemas';

import { isTrustedPreviewMessage } from './preview-message';

const parentWindow = { id: 'parent' } as unknown as Window;
const otherWindow = { id: 'other' } as unknown as Window;
const selfWindow = { id: 'self' } as unknown as Window;

const createMessageEvent = (
  data: unknown,
  source: MessageEvent['source'] = null
): Pick<MessageEvent, 'data' | 'source'> => ({
  data,
  source,
});

describe('isTrustedPreviewMessage', () => {
  it('accepts a message from the direct parent frame', () => {
    expect(
      isTrustedPreviewMessage(
        createMessageEvent(
          { sender: signInExperiencePreviewMessageSender, config: {} },
          parentWindow
        ),
        { parent: parentWindow, self: selfWindow }
      )
    ).toBe(true);
  });

  it('rejects messages when not embedded in a parent frame', () => {
    expect(
      isTrustedPreviewMessage(
        createMessageEvent(
          { sender: signInExperiencePreviewMessageSender, config: {} },
          selfWindow
        ),
        { parent: selfWindow, self: selfWindow }
      )
    ).toBe(false);
  });

  it('rejects messages from a non-parent window', () => {
    expect(
      isTrustedPreviewMessage(
        createMessageEvent(
          { sender: signInExperiencePreviewMessageSender, config: {} },
          otherWindow
        ),
        { parent: parentWindow, self: selfWindow }
      )
    ).toBe(false);
  });

  it('rejects messages with an unexpected sender', () => {
    expect(
      isTrustedPreviewMessage(createMessageEvent({ sender: 'other', config: {} }, parentWindow), {
        parent: parentWindow,
        self: selfWindow,
      })
    ).toBe(false);
  });

  it('rejects non-object message data', () => {
    expect(
      isTrustedPreviewMessage(createMessageEvent('1', parentWindow), {
        parent: parentWindow,
        self: selfWindow,
      })
    ).toBe(false);
  });
});
