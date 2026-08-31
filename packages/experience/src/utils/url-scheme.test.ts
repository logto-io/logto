import { isValidNativeCallbackLink, isValidWebRedirectUri } from './url-scheme';

describe('isValidNativeCallbackLink', () => {
  it.each([
    'logto://callback',
    'logto:logto.android.com',
    'io.logto.app://callback',
    'my-app://cb',
  ])('accepts the custom app scheme %p', (link) => {
    expect(isValidNativeCallbackLink(link)).toBe(true);
  });

  it.each(['https://attacker.example', 'http://attacker.example'])(
    'rejects the web scheme %p',
    (link) => {
      expect(isValidNativeCallbackLink(link)).toBe(false);
    }
  );

  it.each([
    // eslint-disable-next-line no-script-url -- payload under test
    'javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'blob:https://logto.dev/uuid',
    'filesystem:https://logto.dev/temporary/x',
    'view-source:https://logto.dev',
    'file:///etc/passwd',
    'about:blank',
  ])('rejects the script-capable scheme %p', (link) => {
    expect(isValidNativeCallbackLink(link)).toBe(false);
  });

  it.each([
    // eslint-disable-next-line no-script-url -- payload under test
    'JavaScript:alert(1)',
    'java\nscript:alert(1)',
    ' javascript:alert(1)',
  ])('rejects the obfuscated script scheme %p', (link) => {
    expect(isValidNativeCallbackLink(link)).toBe(false);
  });

  it.each(['', '//attacker.example', 'not a url', '/callback'])(
    'rejects the unparseable value %p',
    (link) => {
      expect(isValidNativeCallbackLink(link)).toBe(false);
    }
  );
});

describe('isValidWebRedirectUri', () => {
  it.each(['https://accounts.google.com/o/oauth2/auth', 'http://www.github.com'])(
    'accepts %p',
    (uri) => {
      expect(isValidWebRedirectUri(uri)).toBe(true);
    }
  );

  it.each([
    // eslint-disable-next-line no-script-url -- payload under test
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'about:blank',
  ])('rejects the script-capable scheme %p', (uri) => {
    expect(isValidWebRedirectUri(uri)).toBe(false);
  });

  it('rejects a native deep link', () => {
    expect(isValidWebRedirectUri('logto://callback')).toBe(false);
  });

  it.each(['', 'not a url'])('rejects the unparseable value %p', (uri) => {
    expect(isValidWebRedirectUri(uri)).toBe(false);
  });
});
