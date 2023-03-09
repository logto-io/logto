import { buildIdGenerator } from '@logto/core-kit';
import type { ConnectorResponse, UserInfo } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { appendPath, conditional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { is } from 'superstruct';

import MailIcon from '@/assets/images/mail.svg';
import FormCard from '@/components/FormCard';
import ImageWithErrorFallback from '@/components/ImageWithErrorFallback';
import UnnamedTrans from '@/components/UnnamedTrans';
import UserInfoCard from '@/components/UserInfoCard';
import { adminTenantEndpoint, getBasename, meApi, profileSocialLinkingKeyPrefix } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { useTheme } from '@/hooks/use-theme';
import type { SocialUserInfo } from '@/types/profile';
import { socialUserInfoGuard } from '@/types/profile';

import { popupWindow } from '../../utils';
import type { Row } from '../CardContent';
import CardContent from '../CardContent';
import NotSet from '../NotSet';
import * as styles from './index.module.scss';

type Props = {
  user: UserInfo;
  connectors?: ConnectorResponse[];
  onUpdate: () => void;
};

const LinkAccountSection = ({ user, connectors, onUpdate }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const theme = useTheme();
  const { show: showConfirm } = useConfirmModal();
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const getSocialAuthorizationUri = useCallback(
    async (connectorId: string) => {
      const adminTenantEndpointUrl = new URL(adminTenantEndpoint);
      const state = buildIdGenerator(8)();
      const redirectUri = new URL(`/callback/${connectorId}`, adminTenantEndpointUrl).href;
      const { redirectTo } = await api
        .post('me/social/authorization-uri', { json: { connectorId, state, redirectUri } })
        .json<{ redirectTo: string }>();

      sessionStorage.setItem(profileSocialLinkingKeyPrefix, connectorId);

      return redirectTo;
    },
    [api]
  );

  const tableInfo = useMemo((): Array<Row<Optional<SocialUserInfo>>> => {
    if (!connectors) {
      return [];
    }

    return connectors.map(({ id, name, logo, logoDark, target }) => {
      const logoSrc = theme === AppearanceMode.DarkMode && logoDark ? logoDark : logo;
      const relatedUserDetails = user.identities?.[target]?.details;
      const hasLinked = is(relatedUserDetails, socialUserInfoGuard);

      return {
        key: target,
        icon: <ImageWithErrorFallback src={logoSrc} />,
        label: <UnnamedTrans resource={name} />,
        value: conditional(hasLinked && relatedUserDetails),
        renderer: (user) => (user ? <UserInfoCard user={user} avatarSize="small" /> : <NotSet />),
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
                const callback = new URL(
                  `${getBasename()}/handle-social`,
                  window.location.origin
                ).toString();

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
};

export default LinkAccountSection;
