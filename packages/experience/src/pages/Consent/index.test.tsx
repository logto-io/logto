import type { ConsentInfoResponse, RequestErrorBody } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { consent, getConsentInfo } from '@/apis/consent';

import Consent from '.';

jest.mock('@/apis/consent', () => ({
  consent: jest.fn(),
  getConsentInfo: jest.fn(),
}));

const mockedConsent = consent as jest.MockedFunction<typeof consent>;
const mockedGetConsentInfo = getConsentInfo as jest.MockedFunction<typeof getConsentInfo>;

const consentInfo: ConsentInfoResponse = {
  application: {
    id: 'application_id',
    name: 'Application',
    displayName: null,
    privacyPolicyUrl: null,
    termsOfUseUrl: null,
  },
  user: {
    id: 'user_id',
    name: null,
    avatar: null,
    username: 'user',
    primaryEmail: 'user@example.com',
    primaryPhone: null,
  },
  missingOIDCScope: [],
  missingResourceScopes: [],
  redirectUri: 'https://example.com/callback',
};

const createHttpError = (body: RequestErrorBody) =>
  new HTTPError(
    {
      status: 400,
      statusText: 'Bad Request',
      json: async () => body,
      clone: () => ({
        json: async () => body,
      }),
    } as Response,
    {} as Request,
    {} as ConstructorParameters<typeof HTTPError>[2]
  );

const accessDeniedError = () =>
  createHttpError({
    code: 'oidc.access_denied',
    data: undefined,
    message: 'Access denied.',
  });

const renderConsent = () =>
  renderWithPageContext(
    <SettingsProvider>
      <UserInteractionContextProvider>
        <Consent />
      </UserInteractionContextProvider>
    </SettingsProvider>
  );

describe('Consent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders generic access denied page when consent info is denied', async () => {
    mockedGetConsentInfo.mockRejectedValueOnce(accessDeniedError());

    const { queryByText } = renderConsent();

    await waitFor(() => {
      expect(queryByText('error.access_denied')).not.toBeNull();
    });

    expect(queryByText('error.application_access_denied')).not.toBeNull();
    expect(queryByText('action.authorize')).toBeNull();
    expect(queryByText('action.cancel')).toBeNull();
  });

  it('renders generic access denied page when consent submission is denied', async () => {
    mockedGetConsentInfo.mockResolvedValueOnce(consentInfo);
    mockedConsent.mockRejectedValueOnce(accessDeniedError());

    const { getByText, queryByText } = renderConsent();

    await waitFor(() => {
      expect(queryByText('action.authorize')).not.toBeNull();
    });

    fireEvent.click(getByText('action.authorize'));

    await waitFor(() => {
      expect(queryByText('error.access_denied')).not.toBeNull();
    });

    expect(queryByText('error.application_access_denied')).not.toBeNull();
    expect(queryByText('action.authorize')).toBeNull();
    expect(queryByText('action.cancel')).toBeNull();
  });
});
