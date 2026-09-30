import { Prompt, useLogto } from '@logto/react';
import {
  ExtraParamsKey,
  OrganizationInvitationStatus,
  ossConsolePath,
  type OrganizationInvitationEntity,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import { adminTenantEndpoint, meApi } from '@/consts';
import { type RequestError, useStaticApi } from '@/hooks/use-api';
import useRedirectUri from '@/hooks/use-redirect-uri';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import SwitchAccount from '@/pages/AcceptInvitation/SwitchAccount';
import { saveRedirect } from '@/utils/storage';

/**
 * Where the invitation email of a self-hosted deployment lands.
 *
 * The link carries a one-time token bound to the invitee's email. Signing in with it creates the
 * invitee's account on the first visit, or signs them in to the account they already have, even
 * while another account is signed in. Once the invitee is signed in, the invitation is accepted
 * and they land in Console as a member of the tenant.
 */
function OssAcceptInvitation() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const redirectUri = useRedirectUri();
  const { invitationId = '' } = useParams();
  const [searchParameters] = useSearchParams();
  const oneTimeToken = searchParameters.get(ExtraParamsKey.OneTimeToken);
  const email = searchParameters.get('email');
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const silentApi = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });
  const fetcher = useSwrFetcher<OrganizationInvitationEntity>(silentApi);
  const hasStartedSignIn = useRef(false);
  const [acceptError, setAcceptError] = useState<unknown>();

  // Only returned to the invitee it is addressed to, and 403 to anyone else.
  const { data: invitation, error } = useSWR<OrganizationInvitationEntity, RequestError>(
    isAuthenticated && !oneTimeToken && invitationId && `me/invitations/${invitationId}`,
    fetcher
  );

  useEffect(() => {
    if (isLoading || !invitationId || hasStartedSignIn.current) {
      return;
    }

    // The link signs the invitee in, whoever is signed in now. Come back here without the token,
    // so it is used only once.
    if (oneTimeToken && email) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref guards against duplicate sign-in redirects
      hasStartedSignIn.current = true;
      saveRedirect(new URL(window.location.pathname, window.location.origin));
      void signIn({
        redirectUri: redirectUri.href,
        // The link is for the invitee: drop the tokens of whoever is signed in now, or the callback
        // would find them still signed in and never complete the invitee's sign-in. `login` then
        // authenticates with the token even over an existing session, e.g. an admin testing the
        // link, or an account without an email.
        prompt: [Prompt.Login, Prompt.Consent],
        extraParams: {
          [ExtraParamsKey.OneTimeToken]: oneTimeToken,
          [ExtraParamsKey.LoginHint]: email,
        },
      });
      return;
    }

    if (!isAuthenticated) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref guards against duplicate sign-in redirects
      hasStartedSignIn.current = true;
      saveRedirect();
      void signIn(redirectUri.href);
    }
  }, [email, invitationId, isAuthenticated, isLoading, oneTimeToken, redirectUri, signIn]);

  useEffect(() => {
    if (invitation?.status !== OrganizationInvitationStatus.Pending) {
      return;
    }

    (async () => {
      try {
        await api.patch(`me/invitations/${encodeURIComponent(invitation.id)}/status`, {
          json: { status: OrganizationInvitationStatus.Accepted },
        });
        // The grant made before joining holds no Management API scope, so consent again for it,
        // then land in Console.
        saveRedirect(new URL(ossConsolePath, window.location.origin));
        await signIn({ redirectUri: redirectUri.href, prompt: Prompt.Consent });
      } catch (error: unknown) {
        setAcceptError(error);
      }
    })();
  }, [api, invitation, redirectUri.href, signIn]);

  if (!invitationId || error?.status === 404) {
    return <AppError errorMessage={t('invitation.invitation_not_found')} />;
  }

  if (isLoading || !isAuthenticated || oneTimeToken) {
    return <AppLoading />;
  }

  // Signed in, but not as the invitee.
  if (error?.status === 403) {
    return (
      <SwitchAccount
        onClickSwitch={() => {
          saveRedirect();
          void signIn({ redirectUri: redirectUri.href, prompt: Prompt.Login });
        }}
      />
    );
  }

  if (
    acceptError ??
    conditional(invitation && invitation.status !== OrganizationInvitationStatus.Pending)
  ) {
    return <AppError errorMessage={t('invitation.invalid_invitation_status')} />;
  }

  return <AppLoading />;
}

export default OssAcceptInvitation;
