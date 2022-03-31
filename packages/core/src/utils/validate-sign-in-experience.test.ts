import { BrandingStyle } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import { mockBranding } from '@/utils/mock';
import { validateBranding, validateTermsOfUse } from '@/utils/validate-sign-in-experience';

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
