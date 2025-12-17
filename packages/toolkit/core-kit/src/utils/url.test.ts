import { describe, expect, it } from 'vitest';

import {
  isFileAssetPath,
  isLocalhost,
  isValidUrl,
  parseRange,
  validateRedirectUrl,
} from './url.js';

describe('url utilities', () => {
  it('should allow valid redirect URIs', () => {
    expect(validateRedirectUrl('http://localhost:3001', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://logto.dev/callback', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://my-company.com/callback?test=123', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://abc.com/callback?test=123#param=hash', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://*.example.com/callback', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://pr-*-myapp.vercel.app/callback', 'web')).toBeTruthy();
    expect(validateRedirectUrl('https://example.com/callback/*', 'web')).toBeTruthy();
    expect(validateRedirectUrl('io.logto://my-app/callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('com.company://myDemoApp/callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('com.company://demo:1234', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('io.logto.SwiftUI-Demo://callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('io.logto.SwiftUI+Demo://callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('logto:/my-app/callback', 'mobile')).toBeTruthy();
    expect(validateRedirectUrl('http1://localhost:3001', 'mobile')).toBeTruthy();
  });

  it('should detect invalid redirect URIs', () => {
    expect(validateRedirectUrl('io.logto://my-app/callback', 'web')).toBeFalsy();
    expect(validateRedirectUrl('ws://com.company://demo:1234', 'web')).toBeFalsy();
    expect(validateRedirectUrl('abc.com', 'web')).toBeFalsy();
    expect(validateRedirectUrl('abc.com', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('http://localhost:3001', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('https://logto.dev/callback', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('demoApp/callback', 'mobile')).toBeFalsy();
    expect(validateRedirectUrl('https://example.com:*/*', 'web')).toBeFalsy();
    expect(validateRedirectUrl('https://example.com/callback?x=*', 'web')).toBeFalsy();
    expect(validateRedirectUrl('ht*ps://example.com/callback', 'web')).toBeFalsy();
    expect(validateRedirectUrl('https://*/callback', 'web')).toBeFalsy();
    expect(validateRedirectUrl('https://example.com/callback/../../admin', 'web')).toBeFalsy();
    expect(validateRedirectUrl('https://example.com/callback/%2e%2e/admin', 'web')).toBeFalsy();
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

  it('should be able to parse value from request URL with range header', () => {
    expect(parseRange('bytes=0-499')).toEqual({ start: 0, end: 499, count: 500 });
    expect(parseRange('bytes=0-')).toEqual({ start: 0, end: undefined, count: undefined });
    expect(() => parseRange('invalid')).toThrowError('Range not satisfiable.');
  });

  it('should be able to check if a request path is file asset', () => {
    expect(isFileAssetPath('/file.js')).toBe(true);
    expect(isFileAssetPath('/file.css')).toBe(true);
    expect(isFileAssetPath('/file.png')).toBe(true);
    expect(isFileAssetPath('/oidc/.well-known/openid-configuration')).toBe(false);
    expect(isFileAssetPath('/oidc/auth')).toBe(false);
    expect(isFileAssetPath('/api/interaction/submit')).toBe(false);
    expect(isFileAssetPath('/consent')).toBe(false);
    expect(
      isFileAssetPath(
        '/callback/45doq0d004awrjyvdbp92?state=PxsR_Iqtkxw&code=4/0AcvDMrCOMTFXWlKzTcUO24xDify5tQbIMYvaYDS0sj82NzzYlrG4BWXJB4-OxjBI1RPL8g&scope=email%20profile%20openid%20https:/www.googleapis.com/auth/userinfo.profile%20https:/www.googleapis.com/auth/userinfo.email&authuser=0&hd=silverhand.io&prompt=consent'
      )
    ).toBe(false);
  });
});

describe('isLocalhost()', () => {
  it('should return true for localhost', () => {
    expect(isLocalhost('http://localhost')).toBeTruthy();
    expect(isLocalhost('http://localhost:3001')).toBeTruthy();
    expect(isLocalhost('https://localhost:3001')).toBeTruthy();
    expect(isLocalhost('http://localhost:3001/callback')).toBeTruthy();
  });

  it('should return false for non-localhost', () => {
    expect(isLocalhost('https://localhost.dev/callback')).toBeFalsy();
    expect(isLocalhost('https://my-company.com/callback?test=123')).toBeFalsy();
    expect(isLocalhost('https://abc.com/callback?test=123#param=hash')).toBeFalsy();
  });
});
