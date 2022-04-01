import { BrandingStyle, SignInMethodState } from '@logto/schemas';

import { ConnectorType } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  validateBranding,
  validateSignInMethods,
  validateTermsOfUse,
} from '@/lib/sign-in-experience';
import {
  mockAliyunDmConnectorInstance,
  mockBranding,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockSignInMethods,
} from '@/utils/mock';

const enabledConnectorInstances = [mockFacebookConnectorInstance, mockGithubConnectorInstance];

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

describe('validate sign-in methods', () => {
  describe('There must be one and only one primary sign-in method.', () => {
    test('should throw when there is no primary sign-in method', () => {
      expect(() => {
        validateSignInMethods({ ...mockSignInMethods, username: SignInMethodState.disabled }, []);
      }).toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });

    test('should throw when there are more than one primary sign-in methods', () => {
      expect(() => {
        validateSignInMethods({ ...mockSignInMethods, social: SignInMethodState.primary }, []);
      }).toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });
  });

  describe('There must be at least one enabled connector when the specific sign-in method is enabled.', () => {
    test('should throw when there is no enabled email connector and email sign-in method is enabled', async () => {
      expect(() => {
        validateSignInMethods(
          { ...mockSignInMethods, email: SignInMethodState.secondary },
          // @ts-expect-error-this-line
          enabledConnectorInstances
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
          { ...mockSignInMethods, sms: SignInMethodState.secondary },
          // @ts-expect-error-this-line
          enabledConnectorInstances
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
        validateSignInMethods({ ...mockSignInMethods, social: SignInMethodState.secondary }, [
          // @ts-expect-error-this-line
          mockAliyunDmConnectorInstance,
        ]);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Social,
        })
      );
    });
  });
});
