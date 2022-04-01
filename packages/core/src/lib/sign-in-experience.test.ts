import { BrandingStyle, SignInMethodState } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import {
  validateBranding,
  validateSignInMethods,
  validateTermsOfUse,
} from '@/lib/sign-in-experience';
import { mockBranding, mockSignInMethods } from '@/utils/mock';

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
    test('should throw when there is no primary sign-in method', async () => {
      expect(() => {
        validateSignInMethods({
          ...mockSignInMethods,
          username: SignInMethodState.disabled,
        });
      }).toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });

    test('should throw when there are more than one primary sign-in methods', async () => {
      expect(() => {
        validateSignInMethods({
          ...mockSignInMethods,
          social: SignInMethodState.primary,
        });
      }).toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });
  });
});
