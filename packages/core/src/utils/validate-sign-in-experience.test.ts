import { BrandingStyle, SignInMethodState } from '@logto/schemas';

import { ConnectorType } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  mockBranding,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockSignInMethods,
} from '@/utils/mock';
import {
  validateBranding,
  validateSignInMethods,
  validateTermsOfUse,
} from '@/utils/validate-sign-in-experience';

const getConnectorInstances = jest.fn(async () => [
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
]);

jest.mock('@/connectors', () => ({
  ...jest.requireActual('@/connectors'),
  getConnectorInstances: jest.fn(async () => getConnectorInstances()),
}));

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
  test('should not throw if without sign-in methods', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    await expect(validateSignInMethods(undefined, undefined)).resolves.not.toThrow();
  });

  describe('There must be one and only one primary sign-in method.', () => {
    test('should throw when there is no primary sign-in method', async () => {
      await expect(
        validateSignInMethods({
          ...mockSignInMethods,
          username: SignInMethodState.disabled,
        })
      ).rejects.toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });

    test('should throw when there are more than one primary sign-in methods', async () => {
      await expect(
        validateSignInMethods({
          ...mockSignInMethods,
          social: SignInMethodState.primary,
        })
      ).rejects.toMatchError(
        new RequestError('sign_in_experiences.not_one_and_only_one_primary_sign_in_method')
      );
    });
  });
});

describe('There must be at least one enabled connector when the specific sign-in method is enabled.', () => {
  beforeEach(() => {
    getConnectorInstances.mockResolvedValueOnce([]);
  });

  test('should throw when there is no enabled email connector and email sign-in method is enabled', async () => {
    await expect(
      validateSignInMethods({
        ...mockSignInMethods,
        email: SignInMethodState.secondary,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  });

  test('should throw when there is no enabled SMS connector and SMS sign-in method is enabled', async () => {
    await expect(
      validateSignInMethods({
        ...mockSignInMethods,
        sms: SignInMethodState.secondary,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.SMS,
      })
    );
  });

  test('should throw when there is no enabled social connector and social sign-in method is enabled', async () => {
    await expect(
      validateSignInMethods({
        ...mockSignInMethods,
        social: SignInMethodState.secondary,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Social,
      })
    );
  });
});

test('should throw when the social connector IDs are empty and social sign-in method is enabled', async () => {
  await expect(
    validateSignInMethods(
      {
        ...mockSignInMethods,
        social: SignInMethodState.secondary,
      },
      []
    )
  ).rejects.toMatchError(new RequestError('sign_in_experiences.empty_social_connectors'));
});

test('should throw when some selected social connector are disabled and social sign-in method is enabled', async () => {
  await expect(
    validateSignInMethods(
      {
        ...mockSignInMethods,
        social: SignInMethodState.secondary,
      },
      ['google', 'facebook']
    )
  ).rejects.toMatchError(new RequestError('sign_in_experiences.invalid_social_connectors'));
});
