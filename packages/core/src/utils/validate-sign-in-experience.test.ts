import { BrandingStyle, SignInMethodState } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import { mockBranding, mockSignInMethods } from '@/utils/mock';
import {
  validateBranding,
  validateSignInMethods,
  validateTermsOfUse,
} from '@/utils/validate-sign-in-experience';

describe('validate branding', () => {
  test('should not throw if without branding', () => {
    expect(() => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      validateBranding(undefined);
    }).not.toThrow();
  });

  test('should throw when the UI style contains the slogan and slogan is empty', () => {
    expect(() => {
      validateBranding({
        ...mockBranding,
        style: BrandingStyle.Logo_Slogan,
        slogan: ' \t\n',
      });
    }).toMatchError(new RequestError('sign_in_experiences.empty_slogan'));
  });
});

describe('validate terms of use', () => {
  test('should not throw if without terms of use', () => {
    expect(() => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      validateTermsOfUse(undefined);
    }).not.toThrow();
  });

  test('should throw when terms of use is enabled and content URL is empty', () => {
    expect(() => {
      validateTermsOfUse({
        enabled: true,
      });
    }).toMatchError(new RequestError('sign_in_experiences.empty_content_url_of_terms_of_use'));
  });
});

describe('validate sign-in methods and social connector IDs', () => {
  test('should not throw if without sign-in methods', () => {
    expect(() => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      validateSignInMethods(undefined);
    }).not.toThrow();
  });

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
