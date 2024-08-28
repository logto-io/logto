import type { SocialUserInfo } from '@logto/connector-kit';
import { socialUserInfoGuard } from '@logto/connector-kit';
import { Theme } from '@logto/schemas';
import type { ConnectorResponse, UserProfileResponse } from '@logto/schemas';
import { generateStandardId } from '@logto/shared/universal';
import type { Optional } from '@silverhand/essentials';
import { appendPath, conditional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import MailIcon from '@/assets/icons/mail.svg';
import FormCard from '@/components/FormCard';
import UnnamedTrans from '@/components/UnnamedTrans';
import UserInfoCard from '@/components/UserInfoCard';
import { adminTenantEndpoint, meApi, storageKeys } from '@/consts';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import { popupWindow } from '../../utils';
import type { Row } from '../CardContent';
import CardContent from '../CardContent';
import NotSet from '../NotSet';

import * as styles from './index.module.scss';

type Props = {
  readonly user: UserProfileResponse;
  readonly connectors?: ConnectorResponse[];
  readonly onUpdate: () => void;
};

function LinkAccountSection({ user, connectors, onUpdate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const theme = useTheme();
  const { show: showConfirm } = useConfirmModal();
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const getSocialAuthorizationUri = useCallback(
    async (connectorId: string) => {
      const adminTenantEndpointUrl = new URL(adminTenantEndpoint);
      const state = generateStandardId(8);
      const redirectUri = new URL(`/callback/${connectorId}`, adminTenantEndpointUrl).href;
      const { redirectTo } = await api
        .post('me/social/authorization-uri', { json: { connectorId, state, redirectUri } })
        .json<{ redirectTo: string }>();

      sessionStorage.setItem(storageKeys.linkingSocialConnector, connectorId);

      return redirectTo;
    },
    [api]
  );

  const tableInfo = useMemo((): Array<Row<Optional<SocialUserInfo>>> => {
    if (!connectors) {
      return [];
    }

    return connectors.map(({ id, name, logo, logoDark, target }) => {
      const logoSrc = theme === Theme.Dark && logoDark ? logoDark : logo;
      const relatedUserDetails = user.identities[target]?.details;

      const socialUserInfo = socialUserInfoGuard.safeParse(relatedUserDetails);
      const hasLinked = socialUserInfo.success;

      return {
        key: target,
        icon: <ImageWithErrorFallback src={logoSrc} />,
        label: <UnnamedTrans resource={name} />,
        value: conditional(hasLinked && socialUserInfo.data),
        renderer: (user) => (user ? <UserInfoCard user={user} /> : <NotSet />),
        action: hasLinked
          ? {
              name: 'profile.unlink',
              handler: async () => {
                const [result] = await showConfirm({
                  ModalContent: () => (
                    <Trans components={{ span: <UnnamedTrans resource={name} /> }}>
                      {t('profile.unlink_reminder')}
                    </Trans>
                  ),
                  confirmButtonText: 'profile.unlink_confirm_text',
                });

                if (result) {
                  await api.delete(`me/social/identity/${id}`);
                  onUpdate();
                }
              },
            }
          : {
              name: 'profile.link',
              handler: async () => {
                const authUri = await getSocialAuthorizationUri(id);
                // Profile page has been moved to the root path instead of being nested inside a tenant context.
                // Therefore, we don't need to use `getUrl` to prepend the tenant segment in the callback URL.
                // Also, link social is Cloud only, so no need to conditionally prepend the `ossConsolePath`, either.
                const callback = new URL('/handle-social', window.location.href).href;

                const queries = new URLSearchParams({
                  redirectTo: authUri,
                  connectorId: id,
                  callback,
                });

                const newWindow = popupWindow(
                  appendPath(adminTenantEndpoint, `/springboard?${queries.toString()}`).href,
                  'Link social account with Logto',
                  600,
                  640
                );

                newWindow?.focus();
              },
            },
      };
    });
  }, [
    api,
    connectors,
    theme,
    user.identities,
    showConfirm,
    t,
    onUpdate,
    getSocialAuthorizationUri,
  ]);

  return (
    <FormCard title="profile.link_account.title">
      <CardContent
        title="profile.link_account.email_sign_in"
        data={[
          {
            key: 'email',
            label: 'profile.link_account.email',
            value: user.primaryEmail,
            renderer: (email) =>
              email ? (
                <div className={styles.wrapper}>
                  <MailIcon />
                  <span>{email}</span>
                </div>
              ) : (
                <NotSet />
              ),
            action: {
              name: user.primaryEmail ? 'profile.change' : 'profile.link',
              handler: () => {
                navigate('link-email', {
                  state: { email: user.primaryEmail, action: 'changeEmail' },
                });
              },
            },
          },
        ]}
      />
      <CardContent title="profile.link_account.social_sign_in" data={tableInfo} />
    </FormCard>
  );
}

export default LinkAccountSection;
