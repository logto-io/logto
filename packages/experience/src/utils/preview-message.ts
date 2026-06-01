import { isObject } from '@silverhand/essentials';

export const previewMessageSender = 'ac_preview';

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
export const isTrustedPreviewMessage = (event: MessageEvent): boolean => {
  if (!isObject(event.data) || event.data.sender !== previewMessageSender) {
    return false;
  }

  if (window.parent === window) {
    return false;
  }

  return event.source === window.parent;
};
