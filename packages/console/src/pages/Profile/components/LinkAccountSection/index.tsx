import { buildIdGenerator } from '@logto/core-kit';
import type { ConnectorResponse, User } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { is } from 'superstruct';

import MailIcon from '@/assets/images/mail.svg';
import ImageWithErrorFallback from '@/components/ImageWithErrorFallback';
import UnnamedTrans from '@/components/UnnamedTrans';
import UserInfoCard from '@/components/UserInfoCard';
import { adminTenantEndpoint, getBasename, meApi, profileSocialLinkingKeyPrefix } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import type { SocialUserInfo } from '@/types/profile';
import { socialUserInfoGuard } from '@/types/profile';

import { popupWindow } from '../../utils';
import type { Action, Row } from '../CardContent';
import CardContent from '../CardContent';
import NotSet from '../NotSet';
import Section from '../Section';
import * as styles from './index.module.scss';

type Props = {
  user: User;
  onUpdate: () => void;
};

const LinkAccountSection = ({ user, onUpdate }: Props) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const [connectors, setConnectors] = useState<ConnectorResponse[]>();

  useEffect(() => {
    (async () => {
      const connectors = await api.get('me/social/connectors').json<ConnectorResponse[]>();

      setConnectors(connectors);
    })();
  }, [api]);

  const getSocialAuthorizationUri = useCallback(
    async (connectorId: string) => {
      const state = buildIdGenerator(8)();
      const redirectUri = `${adminTenantEndpoint}/callback/${connectorId}`;
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
      const relatedUserDetails = user.identities[target]?.details;
      const hasLinked = is(relatedUserDetails, socialUserInfoGuard);
      const conditionalUnlinkAction: Action[] = hasLinked
        ? [
            {
              name: 'profile.unlink',
              handler: async () => {
                await api.delete(`me/social/identity/${id}`);
                onUpdate();
              },
            },
          ]
        : [];

      return {
        key: target,
        icon: <ImageWithErrorFallback src={logoSrc} />,
        label: <UnnamedTrans resource={name} />,
        value: conditional(hasLinked && relatedUserDetails),
        renderer: (user) => (user ? <UserInfoCard user={user} avatarSize="small" /> : <NotSet />),
        action: [
          ...conditionalUnlinkAction,
          {
            name: hasLinked ? 'profile.change' : 'profile.link',
            handler: async () => {
              const authUri = await getSocialAuthorizationUri(id);
              const callback = new URL(
                `${getBasename()}/handle-social`,
                `${adminTenantEndpoint}`
              ).toString();

              const queries = new URLSearchParams({
                redirectTo: authUri,
                connectorId: id,
                callback,
              });

              const newWindow = popupWindow(
                `${adminTenantEndpoint}/springboard?${queries.toString()}`,
                'Link social account with Logto',
                600,
                640
              );

              newWindow?.focus();
            },
          },
        ],
      };
    });
  }, [connectors, theme, user.identities, api, onUpdate, getSocialAuthorizationUri]);

  return (
    <Section title="profile.link_account.title">
      <CardContent
        title="profile.link_account.email_sign_in"
        data={[
          {
            key: 'email',
            label: 'profile.link_account.email',
            value: user.primaryEmail,
            renderer: (email) => (
              <div className={styles.wrapper}>
                <MailIcon />
                {email}
              </div>
            ),
            action: {
              name: 'profile.change',
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
    </Section>
  );
};

export default LinkAccountSection;
