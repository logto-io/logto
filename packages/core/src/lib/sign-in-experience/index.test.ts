import type { LanguageTag } from '@logto/language-kit';
import { builtInLanguages } from '@logto/phrases-ui';
import type { CreateSignInExperience, SignInExperience } from '@logto/schemas';
import { BrandingStyle } from '@logto/schemas';

import {
  socialTarget01,
  socialTarget03,
  socialTarget02,
  mockBranding,
  mockSignInExperience,
  mockSocialConnectors,
} from '#src/__mocks__/index.js';
import type { LogtoConnector } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  validateBranding,
  validateTermsOfUse,
  validateLanguageInfo,
  removeUnavailableSocialConnectorTargets,
} from '#src/lib/sign-in-experience/index.js';
import { updateDefaultSignInExperience } from '#src/queries/sign-in-experience.js';

const allCustomLanguageTags: LanguageTag[] = [];
const findAllCustomLanguageTags = jest.fn(async () => allCustomLanguageTags);
const getLogtoConnectorsPlaceHolder = jest.fn() as jest.MockedFunction<
  () => Promise<LogtoConnector[]>
>;
const findDefaultSignInExperience = jest.fn() as jest.MockedFunction<
  () => Promise<SignInExperience>
>;

jest.mock('#src/queries/custom-phrase.js', () => ({
  findAllCustomLanguageTags: async () => findAllCustomLanguageTags(),
}));

jest.mock('#src/connectors.js', () => ({
  getLogtoConnectors: async () => getLogtoConnectorsPlaceHolder(),
}));

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

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

describe('validate language info', () => {
  it('should call findAllCustomLanguageTags', async () => {
    await validateLanguageInfo({
      autoDetect: true,
      fallbackLanguage: 'zh-CN',
    });
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('should pass when the language is built-in supported', async () => {
    const builtInSupportedLanguage = 'tr-TR';
    await expect(
      validateLanguageInfo({
        autoDetect: true,
        fallbackLanguage: builtInSupportedLanguage,
      })
    ).resolves.not.toThrow();
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('should pass when the language is custom supported', async () => {
    const customOnlySupportedLanguage = 'zh-HK';
    expect(customOnlySupportedLanguage in builtInLanguages).toBeFalsy();
    findAllCustomLanguageTags.mockResolvedValueOnce([customOnlySupportedLanguage]);
    await expect(
      validateLanguageInfo({
        autoDetect: true,
        fallbackLanguage: customOnlySupportedLanguage,
      })
    ).resolves.not.toThrow();
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('unsupported fallback language should fail', async () => {
    const unsupportedLanguage = 'zh-MO';
    expect(unsupportedLanguage in builtInLanguages).toBeFalsy();
    expect(allCustomLanguageTags.includes(unsupportedLanguage)).toBeFalsy();
    await expect(
      validateLanguageInfo({
        autoDetect: true,
        fallbackLanguage: unsupportedLanguage,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'sign_in_experiences.unsupported_default_language',
        language: unsupportedLanguage,
      })
    );
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

describe('remove unavailable social connector targets', () => {
  test('should remove unavailable social connector targets in sign-in experience', async () => {
    const mockSocialConnectorTargets = mockSocialConnectors.map(
      ({ metadata: { target } }) => target
    );
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      socialSignInConnectorTargets: mockSocialConnectorTargets,
    });
    getLogtoConnectorsPlaceHolder.mockResolvedValueOnce(mockSocialConnectors);
    expect(mockSocialConnectorTargets).toEqual([socialTarget01, socialTarget02, socialTarget03]);
    await removeUnavailableSocialConnectorTargets();
    expect(updateDefaultSignInExperience).toBeCalledWith({
      socialSignInConnectorTargets: [socialTarget01, socialTarget02, socialTarget03],
    });
  });
});
