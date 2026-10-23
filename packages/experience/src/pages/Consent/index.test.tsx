import resource from '@logto/phrases-experience';
import type { ConsentInfoResponse, RequestErrorBody } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { consent, getConsentInfo } from '@/apis/consent';
import { abortInteraction } from '@/apis/experience';
import { setupI18nForTesting } from '@/jest.setup';
import { searchKeys } from '@/shared/utils/search-parameters';

import Consent from '.';

jest.mock('@/apis/consent', () => ({
  consent: jest.fn(),
  getConsentInfo: jest.fn(),
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  abortInteraction: jest.fn(),
}));

const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/constants/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

const mockedConsent = consent as jest.MockedFunction<typeof consent>;
const mockedGetConsentInfo = getConsentInfo as jest.MockedFunction<typeof getConsentInfo>;
const mockedAbortInteraction = abortInteraction as jest.MockedFunction<typeof abortInteraction>;
const originalLocation = window.location;
const assign = jest.fn();
const replace = jest.fn();

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
        replace,
        origin: 'http://localhost',
        search: `?${searchKeys.appId}=application_id`,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockIsDevFeaturesEnabled.mockReturnValue(true);
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

  describe('Cancel', () => {
    const abortRedirectTo = 'https://example.com/callback?error=access_denied&state=state';

    it('aborts the interaction and follows the returned redirect', async () => {
      mockedGetConsentInfo.mockResolvedValueOnce(consentInfo);
      mockedAbortInteraction.mockResolvedValueOnce({ redirectTo: abortRedirectTo });

      const { getByText } = renderConsent();

      await waitFor(() => {
        expect(getByText('action.cancel')).not.toBeNull();
      });

      fireEvent.click(getByText('action.cancel'));

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith(abortRedirectTo);
      });

      expect(mockedAbortInteraction).toHaveBeenCalledTimes(1);
    });

    it('falls back to the bare redirect when aborting fails', async () => {
      mockedGetConsentInfo.mockResolvedValueOnce(consentInfo);
      mockedAbortInteraction.mockRejectedValueOnce(new Error('Interaction not found'));

      const { getByText } = renderConsent();

      await waitFor(() => {
        expect(getByText('action.cancel')).not.toBeNull();
      });

      fireEvent.click(getByText('action.cancel'));

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith(consentInfo.redirectUri);
      });

      expect(mockedAbortInteraction).toHaveBeenCalledTimes(1);
    });

    it('keeps the bare redirect when the dev feature is disabled', async () => {
      mockIsDevFeaturesEnabled.mockReturnValue(false);
      mockedGetConsentInfo.mockResolvedValueOnce(consentInfo);

      const { getByText } = renderConsent();

      await waitFor(() => {
        expect(getByText('action.cancel')).not.toBeNull();
      });

      fireEvent.click(getByText('action.cancel'));

      expect(mockedAbortInteraction).not.toHaveBeenCalled();
      expect(replace).toHaveBeenCalledWith(consentInfo.redirectUri);
    });
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
