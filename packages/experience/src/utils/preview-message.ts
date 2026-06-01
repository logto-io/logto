import { signInExperiencePreviewMessageSender } from '@logto/schemas';
import { isObject } from '@silverhand/essentials';

type PreviewMessageEvent = Pick<MessageEvent, 'data' | 'source'>;

type PreviewMessageContext = {
  parent: Window;
  self: Window;
};

const defaultContext = (): PreviewMessageContext => ({
  parent: window.parent,
  self: window,
});

/**
 * Validates a `postMessage` event for sign-in experience live preview.
 *
 * Preview config is sent from the admin Console iframe parent. Console and Experience
 * run on different origins (e.g. admin :3002 vs tenant :3001), so checking
 * `event.origin === window.location.origin` would reject legitimate messages.
 *
 * Instead, require the message to come from the direct parent frame. That matches how
 * {@link SignInExperiencePreview} embeds Experience, and blocks cross-origin windows that
 * only hold a reference (e.g. via `window.open`) because their `event.source` is not
 * `window.parent`. Embedding by non-admin origins is already restricted by CSP
 * `frame-ancestors` on the Experience app.
 */
export const isTrustedPreviewMessage = (
  event: PreviewMessageEvent,
  context: PreviewMessageContext = defaultContext()
): boolean => {
  if (
    !isObject(event.data) ||
    !('sender' in event.data) ||
    event.data.sender !== signInExperiencePreviewMessageSender
  ) {
    return false;
  }

  const { parent, self } = context;

  if (parent === self) {
    return false;
  }

  return event.source === parent;
};
