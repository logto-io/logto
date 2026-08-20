import resource from '@logto/phrases-experience';
import type { ConsentInfoResponse, RequestErrorBody } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { consent, getConsentInfo } from '@/apis/consent';
import { setupI18nForTesting } from '@/jest.setup';
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

const cimdConsentInfo = (name: string): ConsentInfoResponse => ({
  ...consentInfo,
  application: {
    ...consentInfo.application,
    id: 'https://client.example.com/oauth/metadata.json',
    name,
  },
});

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

  describe('CIMD client', () => {
    const { authorize_title, unregistered_client_notice } = resource.en.translation.description;

    // The assertions read the rendered copy, so the phrases have to be the real ones
    beforeAll(async () => {
      await setupI18nForTesting({
        translation: { description: { authorize_title, unregistered_client_notice } },
      });
    });

    afterAll(async () => {
      await setupI18nForTesting();
    });

    it('renders the identifier host in the notice', async () => {
      mockedGetConsentInfo.mockResolvedValueOnce(cimdConsentInfo('Fancy client'));

      const { queryByText, unmount } = renderConsent();

      await waitFor(() => {
        expect(queryByText('client.example.com')).not.toBeNull();
      });

      expect(queryByText(/is self-declared by/)).not.toBeNull();
      unmount();
    });

    it('falls back to the identifier host in the headline when the client declares no name', async () => {
      mockedGetConsentInfo.mockResolvedValueOnce(cimdConsentInfo(''));

      const { queryByText, unmount } = renderConsent();

      await waitFor(() => {
        expect(queryByText('Authorize client.example.com')).not.toBeNull();
      });

      unmount();
    });

    it('does not render the notice for a registered application', async () => {
      mockedGetConsentInfo.mockResolvedValueOnce(consentInfo);

      const { queryByText, unmount } = renderConsent();

      await waitFor(() => {
        expect(queryByText('action.authorize')).not.toBeNull();
      });

      expect(queryByText(/is self-declared by/)).toBeNull();
      unmount();
    });

    it('only submits one selected organization', async () => {
      mockedGetConsentInfo.mockResolvedValueOnce({
        ...cimdConsentInfo('Fancy client'),
        organizations: [
          { id: 'organization_1', name: 'Organization 1' },
          { id: 'organization_2', name: 'Organization 2' },
        ],
      });
      mockedConsent.mockResolvedValueOnce({ redirectTo: '' });

      const { getByText } = renderConsent();

      await waitFor(() => {
        expect(getByText('Organization 1')).not.toBeNull();
      });

      fireEvent.click(getByText('Organization 1'));
      fireEvent.click(getByText('Organization 2'));
      fireEvent.click(getByText('action.authorize'));

      await waitFor(() => {
        expect(mockedConsent).toBeCalledWith(['organization_2']);
      });
    });
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

  it('submits all selected organizations', async () => {
    mockedGetConsentInfo.mockResolvedValueOnce({
      ...consentInfo,
      organizations: [
        { id: 'organization_1', name: 'Organization 1' },
        { id: 'organization_2', name: 'Organization 2' },
      ],
    });
    mockedConsent.mockResolvedValueOnce({ redirectTo: '' });

    const { getByText } = renderConsent();

    await waitFor(() => {
      expect(getByText('Organization 1')).not.toBeNull();
    });

    fireEvent.click(getByText('Organization 1'));
    fireEvent.click(getByText('Organization 2'));
    fireEvent.click(getByText('action.authorize'));

    await waitFor(() => {
      expect(mockedConsent).toBeCalledWith(['organization_1', 'organization_2']);
    });
  });

  it('allows a selected organization to be removed when another remains', async () => {
    mockedGetConsentInfo.mockResolvedValueOnce({
      ...consentInfo,
      organizations: [
        { id: 'organization_1', name: 'Organization 1' },
        { id: 'organization_2', name: 'Organization 2' },
      ],
    });
    mockedConsent.mockResolvedValueOnce({ redirectTo: '' });

    const { getAllByText, getByText } = renderConsent();

    await waitFor(() => {
      expect(getByText('Organization 1')).not.toBeNull();
    });

    fireEvent.click(getByText('Organization 1'));
    fireEvent.click(getByText('Organization 2'));
    fireEvent.click(getAllByText('Organization 1').at(-1)!);
    fireEvent.click(getByText('action.authorize'));

    await waitFor(() => {
      expect(mockedConsent).toBeCalledWith(['organization_2']);
    });
  });
});
