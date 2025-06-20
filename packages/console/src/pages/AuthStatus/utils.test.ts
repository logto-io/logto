import { AuthMessageType } from './types';
import { isCheckAdminTokenMessage, isValidOrigin } from './utils';

describe('AuthStatus Utils', () => {
  describe('isValidOrigin', () => {
    it('should return true for exact same origin', () => {
      expect(isValidOrigin('https://console.logto.io', 'https://console.logto.io')).toBe(true);
      expect(isValidOrigin('http://localhost:3000', 'http://localhost:3000')).toBe(true);
      expect(isValidOrigin('https://app.example.com', 'https://app.example.com')).toBe(true);
    });

    it('should return true for different localhost ports', () => {
      expect(isValidOrigin('http://localhost:3000', 'http://localhost:3001')).toBe(true);
      expect(isValidOrigin('http://localhost:8080', 'http://localhost:9000')).toBe(true);
      expect(isValidOrigin('https://localhost:3000', 'https://localhost:3001')).toBe(true);
    });

    it('should return false if only one is localhost', () => {
      expect(isValidOrigin('http://localhost:3000', 'https://example.com')).toBe(false);
      expect(isValidOrigin('https://example.com', 'http://localhost:3000')).toBe(false);
    });

    it('should return true for same simple TLD', () => {
      expect(isValidOrigin('https://app.example.com', 'https://api.example.com')).toBe(true);
      expect(isValidOrigin('https://www.google.org', 'https://mail.google.org')).toBe(true);
      expect(isValidOrigin('https://sub1.test.net', 'https://sub2.test.net')).toBe(true);
    });

    it('should return true for same compound TLD', () => {
      expect(isValidOrigin('https://app.example.co.uk', 'https://api.example.co.uk')).toBe(true);
      expect(isValidOrigin('https://app.example.com.au', 'https://api.example.com.au')).toBe(true);
      expect(isValidOrigin('https://www.test.net.cn', 'https://api.test.net.cn')).toBe(true);
      expect(
        isValidOrigin('https://portal.university.edu.uk', 'https://library.university.edu.uk')
      ).toBe(true);
    });

    it('should return false for different TLDs', () => {
      expect(isValidOrigin('https://app.example.com', 'https://api.different.com')).toBe(false);
      expect(isValidOrigin('https://app.example.co.uk', 'https://api.example.com')).toBe(false);
      expect(isValidOrigin('https://app.example.com.au', 'https://api.example.co.uk')).toBe(false);
    });

    it('should return true for whitelisted domains', () => {
      // Test logto.io wildcard
      expect(isValidOrigin('https://console.logto.io', 'https://other.domain.com')).toBe(true);
      expect(isValidOrigin('https://api.logto.io', 'https://other.domain.com')).toBe(true);
      expect(isValidOrigin('https://admin.logto.io', 'https://other.domain.com')).toBe(true);

      // Test logto.dev wildcard
      expect(isValidOrigin('https://dev.logto.dev', 'https://other.domain.com')).toBe(true);
      expect(isValidOrigin('https://staging.logto.dev', 'https://other.domain.com')).toBe(true);

      // Test logto-docs.pages.dev wildcard
      expect(isValidOrigin('https://docs.logto-docs.pages.dev', 'https://other.domain.com')).toBe(
        true
      );
      expect(isValidOrigin('https://v1.logto-docs.pages.dev', 'https://other.domain.com')).toBe(
        true
      );
    });

    it('should return false for non-whitelisted domains', () => {
      expect(isValidOrigin('https://evil.com', 'https://good.com')).toBe(false);
      expect(isValidOrigin('https://fake-logto.io.malicious.com', 'https://other.domain.com')).toBe(
        false
      );
      expect(isValidOrigin('https://logto.io.evil.com', 'https://other.domain.com')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidOrigin('not-a-url', 'https://example.com')).toBe(false);
      expect(isValidOrigin('https://example.com', 'not-a-url')).toBe(false);
      expect(isValidOrigin('', 'https://example.com')).toBe(false);
      expect(isValidOrigin('https://example.com', '')).toBe(false);
    });
  });

  describe('isCheckAdminTokenMessage', () => {
    it('should return true for valid CheckAdminTokenMessage', () => {
      const validMessage = {
        type: AuthMessageType.CheckAdminToken,
        requestId: 'test-request-id',
      };
      expect(isCheckAdminTokenMessage(validMessage)).toBe(true);
    });

    it('should return true for valid CheckAdminTokenMessage without requestId', () => {
      const validMessage = {
        type: AuthMessageType.CheckAdminToken,
      };
      expect(isCheckAdminTokenMessage(validMessage)).toBe(true);
    });

    it('should return false for invalid message types', () => {
      expect(isCheckAdminTokenMessage({ type: 'INVALID_TYPE' })).toBe(false);
      expect(isCheckAdminTokenMessage({ type: AuthMessageType.AdminTokenStatus })).toBe(false);
      expect(isCheckAdminTokenMessage({ type: AuthMessageType.AdminTokenError })).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isCheckAdminTokenMessage(null)).toBe(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(isCheckAdminTokenMessage(undefined)).toBe(false);
      expect(isCheckAdminTokenMessage('string')).toBe(false);
      expect(isCheckAdminTokenMessage(123)).toBe(false);
      expect(isCheckAdminTokenMessage([])).toBe(false);
    });

    it('should return false for objects without type property', () => {
      expect(isCheckAdminTokenMessage({})).toBe(false);
      expect(isCheckAdminTokenMessage({ requestId: 'test' })).toBe(false);
    });
  });
});
