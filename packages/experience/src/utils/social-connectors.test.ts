import { GoogleConnector } from '@logto/connector-kit';
import type { ConnectorMetadata } from '@logto/schemas';
import { ConnectorPlatform } from '@logto/schemas';
import { getCookie } from 'tiny-cookie';

import { SearchParameters } from '@/types';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';

import {
  filterSocialConnectors,
  filterPreviewSocialConnectors,
  buildSocialLandingUri,
  getAuthValidationResult,
  getSessionValidationResult,
} from './social-connectors';

const mockConnectors = [
  { platform: 'Web', target: 'facebook' },
  { platform: 'Web', target: 'google' },
  { platform: 'Universal', target: 'facebook' },
  { platform: 'Universal', target: 'wechat' },
  { platform: 'Native', target: 'wechat' },
  { platform: 'Native', target: 'alipay' },
] as ConnectorMetadata[];

jest.mock('@/utils/native-sdk', () => ({
  isNativeWebview: jest.fn(),
  getLogtoNativeSdk: jest.fn(),
}));

// Mock tiny-cookie for new tests
jest.mock('tiny-cookie', () => ({
  getCookie: jest.fn(),
}));

const getLogtoNativeSdkMock = getLogtoNativeSdk as jest.Mock;
const isNativeWebviewMock = isNativeWebview as jest.Mock;
const getCookieMock = getCookie as jest.Mock;

describe('filterSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterSocialConnectors()).toEqual([]);
  });

  it('filter Web Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => false);
    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'wechat' },
    ]);
  });

  it('Native Platform should return empty if not getPostMessage method is injected', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['wechat', 'alipay'],
      },
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([]);
  });

  it('filter Native & Universal  Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['wechat'],
      },
      getPostMessage: jest.fn(),
      callbackLink: 'logto://callback',
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'wechat' },
    ]);
  });

  it('filter Native & Universal Connectors with out callbackLink should only return native connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['wechat'],
      },
      getPostMessage: jest.fn(),
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'wechat' },
    ]);
  });

  it('filter Native Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      platform: 'ios',
      supportedConnector: {
        universal: false,
        nativeTargets: ['wechat'],
      },
      getPostMessage: jest.fn(),
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'wechat' },
    ]);
  });
});

describe('filterPreviewSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Native)).toEqual([]);
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Web)).toEqual([]);
  });

  it('filter Web Connectors', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Web, mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'wechat' },
    ]);
  });

  it('filter Native Connectors', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Native, mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'wechat' },
      { platform: 'Native', target: 'alipay' },
    ]);
  });
});

describe('buildSocialLandingUri', () => {
  it('buildSocialLandingUri', () => {
    getLogtoNativeSdkMock.mockImplementation(() => ({
      platform: 'ios',
      callbackLink: 'logto://callback',
    }));

    const redirectUri = 'https://www.example.com/callback';
    const socialLandingPath = '/social/landing';
    const callbackUri = buildSocialLandingUri(socialLandingPath, redirectUri);

    expect(callbackUri.pathname).toEqual(socialLandingPath);
    expect(callbackUri.searchParams.get(SearchParameters.RedirectTo)).toEqual(redirectUri);
    expect(callbackUri.searchParams.get(SearchParameters.NativeCallbackLink)).toEqual(
      'logto://callback'
    );
  });
});

describe('getAuthValidationResult', () => {
  const mockConnectorId = 'test-connector-id';
  const mockState = 'test-state';
  const mockParams = { [GoogleConnector.oneTapParams.csrfToken]: 'test-csrf' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal social login', () => {
    it('should return true when state is valid', () => {
      // Mock the actual sessionStorage that validateState uses
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockState);
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation();

      const result = getAuthValidationResult({
        isGoogleOneTap: false,
        connectorId: mockConnectorId,
        isExternalCredential: false,
        params: mockParams,
        state: mockState,
      });

      expect(result).toBe(true);
      expect(mockGetItem).toHaveBeenCalledWith(`social_auth_state:${mockConnectorId}`);
      expect(mockRemoveItem).toHaveBeenCalledWith(`social_auth_state:${mockConnectorId}`);

      // Restore the mocks
      mockGetItem.mockRestore();
      mockRemoveItem.mockRestore();
    });

    it('should return false when state is invalid', () => {
      const mockGetItem = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue('different-state');
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation();

      const result = getAuthValidationResult({
        isGoogleOneTap: false,
        connectorId: mockConnectorId,
        isExternalCredential: false,
        params: mockParams,
        state: mockState,
      });

      expect(result).toBe(false);

      mockGetItem.mockRestore();
      mockRemoveItem.mockRestore();
    });

    it('should return false when state is undefined', () => {
      const result = getAuthValidationResult({
        isGoogleOneTap: false,
        connectorId: mockConnectorId,
        isExternalCredential: false,
        params: mockParams,
        state: undefined,
      });

      expect(result).toBe(false);
    });
  });

  describe('Google One Tap - External credentials', () => {
    it('should return true for external credentials', () => {
      const result = getAuthValidationResult({
        isGoogleOneTap: true,
        connectorId: mockConnectorId,
        isExternalCredential: true,
        params: mockParams,
        state: mockState,
      });

      expect(result).toBe(true);
      expect(getCookieMock).not.toHaveBeenCalled();
    });
  });

  describe('Google One Tap - Experience app', () => {
    it('should return true when CSRF token is valid', () => {
      getCookieMock.mockReturnValue('test-csrf');

      const result = getAuthValidationResult({
        isGoogleOneTap: true,
        connectorId: mockConnectorId,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(true);
      expect(getCookieMock).toHaveBeenCalledWith(GoogleConnector.oneTapParams.csrfToken);
    });

    it('should return false when CSRF token is invalid', () => {
      getCookieMock.mockReturnValue('different-csrf');

      const result = getAuthValidationResult({
        isGoogleOneTap: true,
        connectorId: mockConnectorId,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(false);
    });

    it('should return false when CSRF token is missing from params', () => {
      const result = getAuthValidationResult({
        isGoogleOneTap: true,
        connectorId: mockConnectorId,
        isExternalCredential: false,
        params: {},
      });

      expect(result).toBe(false);
    });
  });
});

describe('getSessionValidationResult', () => {
  const mockVerificationId = 'test-verification-id';
  const mockParams = { [GoogleConnector.oneTapParams.csrfToken]: 'test-csrf' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('With verificationId present', () => {
    it('should return true when verificationId is provided', () => {
      const result = getSessionValidationResult({
        verificationId: mockVerificationId,
        isGoogleOneTap: false,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(true);
      expect(getCookieMock).not.toHaveBeenCalled();
    });

    it('should return true for Google One Tap with verificationId', () => {
      const result = getSessionValidationResult({
        verificationId: mockVerificationId,
        isGoogleOneTap: true,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(true);
    });
  });

  describe('Without verificationId', () => {
    it('should return false for normal social login', () => {
      const result = getSessionValidationResult({
        verificationId: undefined,
        isGoogleOneTap: false,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(false);
    });

    it('should return true for external Google One Tap', () => {
      const result = getSessionValidationResult({
        verificationId: undefined,
        isGoogleOneTap: true,
        isExternalCredential: true,
        params: mockParams,
      });

      expect(result).toBe(true);
      expect(getCookieMock).not.toHaveBeenCalled();
    });

    it('should return true when Experience Google One Tap has valid CSRF', () => {
      getCookieMock.mockReturnValue('test-csrf');

      const result = getSessionValidationResult({
        verificationId: undefined,
        isGoogleOneTap: true,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(true);
      expect(getCookieMock).toHaveBeenCalledWith(GoogleConnector.oneTapParams.csrfToken);
    });

    it('should return false when Experience Google One Tap has invalid CSRF', () => {
      getCookieMock.mockReturnValue('different-csrf');

      const result = getSessionValidationResult({
        verificationId: undefined,
        isGoogleOneTap: true,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(false);
    });

    it('should return false when Experience Google One Tap missing CSRF token', () => {
      const result = getSessionValidationResult({
        verificationId: undefined,
        isGoogleOneTap: true,
        isExternalCredential: false,
        params: {},
      });

      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string verificationId as falsy', () => {
      const result = getSessionValidationResult({
        verificationId: '',
        isGoogleOneTap: false,
        isExternalCredential: false,
        params: {},
      });

      expect(result).toBe(false);
    });

    it('should prioritize verificationId over other checks', () => {
      getCookieMock.mockReturnValue('different-csrf');

      const result = getSessionValidationResult({
        verificationId: mockVerificationId,
        isGoogleOneTap: true,
        isExternalCredential: false,
        params: mockParams,
      });

      expect(result).toBe(true);
      expect(getCookieMock).not.toHaveBeenCalled();
    });

    it('should prioritize external credential over CSRF validation', () => {
      getCookieMock.mockReturnValue('different-csrf');

      const result = getSessionValidationResult({
        verificationId: undefined,
        isGoogleOneTap: true,
        isExternalCredential: true,
        params: mockParams,
      });

      expect(result).toBe(true);
      expect(getCookieMock).not.toHaveBeenCalled();
    });
  });
});
