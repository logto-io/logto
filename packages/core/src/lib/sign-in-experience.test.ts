import { BrandingStyle, SignInMethodState, ConnectorType } from '@logto/schemas';

import {
  mockAliyunDmConnector,
  mockFacebookConnector,
  mockGithubConnector,
  mockBranding,
  mockSignInMethods,
} from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import {
  isEnabled,
  validateBranding,
  validateSignInMethods,
  validateTermsOfUse,
} from '@/lib/sign-in-experience';

const enabledConnectors = [mockFacebookConnector, mockGithubConnector];

describe('validate branding', () => {
  test('should throw when the UI style contains the slogan and slogan is empty', () => {
    expect(() => {
      validateBranding({
        ...mockBranding,
        style: BrandingStyle.Logo_Slogan,
        slogan: '',
      });
    }).toMatchError(new RequestError('sign_in_experiences.empty_slogan'));
  });

  test('should throw when the logo is empty', () => {
    expect(() => {
      validateBranding({
        ...mockBranding,
        style: BrandingStyle.Logo,
        logoUrl: ' ',
        slogan: '',
      });
    }).toMatchError(new RequestError('sign_in_experiences.empty_logo'));
  });

  test('should throw when the UI style contains the slogan and slogan is blank', () => {
    expect(() => {
      validateBranding({
        ...mockBranding,
        style: BrandingStyle.Logo_Slogan,
        slogan: ' \t\n',
      });
    }).toMatchError(new RequestError('sign_in_experiences.empty_slogan'));
  });

  test('should not throw when the UI style does not contain the slogan and slogan is empty', () => {
    expect(() => {
      validateBranding({
        ...mockBranding,
        style: BrandingStyle.Logo,
      });
    }).not.toThrow();
  });
});

describe('validate terms of use', () => {
  test('should throw when terms of use is enabled and content URL is empty', () => {
    expect(() => {
      validateTermsOfUse({
        enabled: true,
      });
    }).toMatchError(new RequestError('sign_in_experiences.empty_content_url_of_terms_of_use'));
  });
});

describe('check whether the social sign-in method state is enabled', () => {
  it('should be truthy when sign-in method state is primary', () => {
    expect(isEnabled(SignInMethodState.Primary)).toBeTruthy();
  });

  it('should be truthy when sign-in method state is secondary', () => {
    expect(isEnabled(SignInMethodState.Secondary)).toBeTruthy();
  });

  it('should be falsy when sign-in method state is disabled', () => {
    expect(isEnabled(SignInMethodState.Disabled)).toBeFalsy();
  });
});

describe('validate sign-in methods', () => {
  describe('There must be one and only one primary sign-in method.', () => {
    test('should throw when there is no primary sign-in method', () => {
      expect(() => {
        validateSignInMethods(
          { ...mockSignInMethods, username: SignInMethodState.Disabled },
          [],
          []
        );
      }).toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });

    test('should throw when there are more than one primary sign-in methods', () => {
      expect(() => {
        validateSignInMethods({ ...mockSignInMethods, social: SignInMethodState.Primary }, [], []);
      }).toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });
  });

  describe('There must be at least one enabled connector when the specific sign-in method is enabled.', () => {
    test('should throw when there is no enabled email connector and email sign-in method is enabled', async () => {
      expect(() => {
        validateSignInMethods(
          { ...mockSignInMethods, email: SignInMethodState.Secondary },
          [],
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no enabled SMS connector and SMS sign-in method is enabled', () => {
      expect(() => {
        validateSignInMethods(
          { ...mockSignInMethods, sms: SignInMethodState.Secondary },
          [],
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.SMS,
        })
      );
    });

    test('should throw when there is no enabled social connector and social sign-in method is enabled', () => {
      expect(() => {
        validateSignInMethods(
          { ...mockSignInMethods, social: SignInMethodState.Secondary },
          [],
          [mockAliyunDmConnector]
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Social,
        })
      );
    });
  });

  test('should throw when the social connector targets are empty and social sign-in method is enabled', () => {
    expect(() => {
      validateSignInMethods(
        { ...mockSignInMethods, social: SignInMethodState.Secondary },
        [],
        enabledConnectors
      );
    }).toMatchError(new RequestError('sign_in_experiences.empty_social_connectors'));
  });
});
