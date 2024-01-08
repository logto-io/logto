import { validateRedirectUrl } from './url.js';

describe('url utilities', () => {
  it('should allow valid redirect URIs', () => {
    expect(validateRedirectUrl('http://localhost:3001', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://logto.dev/callback', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://my-company.com/callback?test=123', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://abc.com/callback?test=123#param=hash', 'web')).toBeTruthy();
    expect(validateRedirectUrl('io.logto://my-app/callback', 'native')).toBeTruthy();
    expect(validateRedirectUrl('com.company://myDemoApp/callback', 'native')).toBeTruthy();
    expect(validateRedirectUrl('com.company://demo:1234', 'native')).toBeTruthy();
    expect(validateRedirectUrl('io.logto.SwiftUI-Demo://callback', 'native')).toBeTruthy();
    expect(validateRedirectUrl('io.logto.SwiftUI+Demo://callback', 'native')).toBeTruthy();
    // Native apps on Windows might use this type of custom URI scheme.
    expect(validateRedirectUrl('servicesstudiox11://auth', 'native')).toBeTruthy();
  });

  it('should detect invalid redirect URIs', () => {
    expect(validateRedirectUrl('io.logto://my-app/callback', 'web')).toBeFalsy();
    expect(validateRedirectUrl('ws://com.company://demo:1234', 'web')).toBeFalsy();
    expect(validateRedirectUrl('abc.com', 'web')).toBeFalsy();
    expect(validateRedirectUrl('abc.com', 'native')).toBeFalsy();
    expect(validateRedirectUrl('http://localhost:3001', 'native')).toBeFalsy();
    expect(validateRedirectUrl('https://logto.dev/callback', 'native')).toBeFalsy();
    expect(validateRedirectUrl('demoApp/callback', 'native')).toBeFalsy();
  });
});
