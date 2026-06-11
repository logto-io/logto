import type { ConsentInfoResponse, RequestErrorBody } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { consent, getConsentInfo } from '@/apis/consent';
import { searchKeys } from '@/shared/utils/search-parameters';

import Consent from '.';

jest.mock('@/apis/consent', () => ({
  consent: jest.fn(),
  getConsentInfo: jest.fn(),
}));

const mockedConsent = consent as jest.MockedFunction<typeof consent>;
const mockedGetConsentInfo = getConsentInfo as jest.MockedFunction<typeof getConsentInfo>;
const originalLocation = window.location;
const assign = jest.fn();

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

const renderConsentWithSearchParams = () =>
  renderWithPageContext(
    <SettingsProvider>
      <UserInteractionContextProvider>
        <Consent />
      </UserInteractionContextProvider>
    </SettingsProvider>
  );

describe('Consent', () => {
  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign,
        origin: 'http://localhost',
        search: `?${searchKeys.appId}=application_id`,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders generic access denied page when consent info is denied', async () => {
    mockedGetConsentInfo.mockRejectedValueOnce(accessDeniedError());

    const { queryByText } = renderConsent();

    await waitFor(() => {
      expect(queryByText('error.access_denied')).not.toBeNull();
    });

    expect(queryByText('error.application_access_denied')).not.toBeNull();
    expect(queryByText('account_center.sessions.revoke_session')).not.toBeNull();
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
    expect(queryByText('account_center.sessions.revoke_session')).not.toBeNull();
    expect(queryByText('action.authorize')).toBeNull();
    expect(queryByText('action.cancel')).toBeNull();
  });

  it('signs out from the access denied page', async () => {
    mockedGetConsentInfo.mockRejectedValueOnce(accessDeniedError());

    const { getByText, queryByText } = renderConsentWithSearchParams();

    await waitFor(() => {
      expect(queryByText('account_center.sessions.revoke_session')).not.toBeNull();
    });

    fireEvent.click(getByText('account_center.sessions.revoke_session'));

    expect(assign).toBeCalledWith('http://localhost/oidc/session/end?client_id=application_id');
  });
});
