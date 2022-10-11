import { BrandingStyle } from '@logto/schemas';

import { mockBranding } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import { validateBranding, validateTermsOfUse } from '@/lib/sign-in-experience';

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
