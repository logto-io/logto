import { useLogto } from '@logto/react';
import { OrganizationInvitationStatus, getTenantIdFromOrganizationId } from '@logto/schemas';
import { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type InvitationResponse } from '@/cloud/types/router';
import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import { isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { type RequestError } from '@/hooks/use-api';
import useRedirectUri from '@/hooks/use-redirect-uri';
import { saveRedirect } from '@/utils/storage';

import SwitchAccount from './SwitchAccount';
import { buildInvitationAcceptUrl, buildInvitationAuthPath } from './utils';

function AcceptInvitation() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const redirectUri = useRedirectUri();
  const { invitationId = '' } = useParams();
  const [searchParameters] = useSearchParams();
  const oneTimeToken = searchParameters.get('one_time_token');
  const cloudApi = useCloudApi();
  const { navigateTenant, resetTenants } = useContext(TenantsContext);
  const hasStartedSignIn = useRef(false);
  const authFormRef = useRef<HTMLFormElement>(null);

  // The request is only made when the user has signed-in and the invitation ID is available.
  // The response data is returned only when the current user matches the invitee email. Otherwise, it returns 404.
  const { data: invitation, error } = useSWR<InvitationResponse, RequestError>(
    isAuthenticated && invitationId && `/api/invitations/${invitationId}`,
    async () => cloudApi.get('/api/invitations/:invitationId', { params: { invitationId } })
  );

  useEffect(() => {
    if (isLoading || isAuthenticated || !invitationId || hasStartedSignIn.current) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref guards against duplicate sign-in redirects
    hasStartedSignIn.current = true;

    if (!isDevFeaturesEnabled || !oneTimeToken) {
      saveRedirect(buildInvitationAcceptUrl(invitationId));
      void signIn(redirectUri.href, 'signUp');
      return;
    }

    authFormRef.current?.requestSubmit();
  }, [invitationId, isAuthenticated, isLoading, oneTimeToken, redirectUri, signIn]);

  useEffect(() => {
    if (!invitation || invitation.status !== OrganizationInvitationStatus.Pending) {
      return;
    }

    (async () => {
      const { id, organizationId } = invitation;

      // Accept the invitation and redirect to the tenant page.
      await cloudApi.patch(`/api/invitations/:invitationId/status`, {
        params: { invitationId: id },
        body: { status: OrganizationInvitationStatus.Accepted },
      });

      const data = await cloudApi.get('/api/tenants');
      resetTenants(data);
      navigateTenant(getTenantIdFromOrganizationId(organizationId));
    })();
  }, [cloudApi, invitation, navigateTenant, resetTenants]);

  if (!invitationId) {
    return <AppError errorMessage={t('invitation.invitation_not_found')} />;
  }

  const invitationAuthForm = isDevFeaturesEnabled && oneTimeToken && (
    <form
      ref={authFormRef}
      hidden
      method="post"
      action={buildInvitationAuthPath(invitationId, oneTimeToken)}
    />
  );

  if (isLoading || !isAuthenticated) {
    return (
      <>
        {invitationAuthForm}
        <AppLoading />
      </>
    );
  }

  // No invitation returned, indicating the current signed-in user is not the invitee.
  if (error?.status === 403) {
    return (
      <SwitchAccount
        onClickSwitch={() => {
          saveRedirect(buildInvitationAcceptUrl(invitationId));
          void signIn(redirectUri.href);
        }}
      />
    );
  }

  if (error?.status === 404) {
    return <AppError errorMessage={t('invitation.invitation_not_found')} />;
  }

  if (invitation && invitation.status !== OrganizationInvitationStatus.Pending) {
    return <AppError errorMessage={t('invitation.invalid_invitation_status')} />;
  }

  return <AppLoading />;
}

export default AcceptInvitation;
