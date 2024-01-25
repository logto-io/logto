import { isValidUrl, validateRedirectUrl } from './url.js';

describe('url utilities', () => {
  it('should allow valid redirect URIs', () => {
    expect(validateRedirectUrl('http://localhost:3001', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://logto.dev/callback', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://my-company.com/callback?test=123', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://abc.com/callback?test=123#param=hash', 'web')).toBeTruthy();
    expect(validateRedirectUrl('io.logto://my-app/callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('com.company://myDemoApp/callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('com.company://demo:1234', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('io.logto.SwiftUI-Demo://callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('io.logto.SwiftUI+Demo://callback', 'mobile')).toBeTruthy();
  });

  it('should detect invalid redirect URIs', () => {
    expect(validateRedirectUrl('io.logto://my-app/callback', 'web')).toBeFalsy();
    expect(validateRedirectUrl('ws://com.company://demo:1234', 'web')).toBeFalsy();
    expect(validateRedirectUrl('abc.com', 'web')).toBeFalsy();
    expect(validateRedirectUrl('abc.com', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('http://localhost:3001', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('https://logto.dev/callback', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('demoApp/callback', 'mobile')).toBeFalsy();
  });

  it('should allow valid URIs', () => {
    expect(isValidUrl('http://localhost:3001')).toBeTruthy();
    expect(isValidUrl('https://google.com')).toBeTruthy();
    expect(isValidUrl('https://logto.dev/callback')).toBeTruthy();
    expect(isValidUrl('https://my-company.com/callback?test=123')).toBeTruthy();
    expect(isValidUrl('https://abc.com/callback?test=123#param=hash')).toBeTruthy();
    expect(isValidUrl('io.logto://my-app/callback')).toBeTruthy();
    expect(isValidUrl('io.logto.SwiftUI-Demo://callback')).toBeTruthy();
  });

  it('should detect invalid URIs', () => {
    expect(isValidUrl('invalid_url')).toBeFalsy();
    expect(isValidUrl('abc.com')).toBeFalsy();
    expect(isValidUrl('abc.com/callback')).toBeFalsy();
    expect(isValidUrl('abc.com/callback?test=123')).toBeFalsy();
    expect(isValidUrl('abc.com/callback#test=123')).toBeFalsy();
  });
});
