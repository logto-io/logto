import { getLogoUrl } from '@experience/shared/utils/logo';
import {
  AccountCenterControlValue,
  ConnectorPlatform,
  type ExperienceSocialConnector,
  type Identity,
} from '@logto/schemas';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ConfirmModal from '@ac/components/ConfirmModal';
import { getSocialAddRoute, getSocialRemoveRoute } from '@ac/constants/routes';
import { getRedirectUrl, setRedirectUrl } from '@ac/utils/account-center-route';
import { getLocalizedConnectorName } from '@ac/utils/social-connector';

import styles from './index.module.scss';

type SocialIdentityDetails = Partial<{
  name: string;
  email: string;
  avatar: string;
}>;

const getSocialIdentityDetail = (identity: Identity, key: keyof SocialIdentityDetails) => {
  const value = identity.details?.[key];

  return typeof value === 'string' ? value : undefined;
};

const filterSocialConnectors = (connectors: ExperienceSocialConnector[]) => {
  const connectorMap = new Map<string, ExperienceSocialConnector>();

  for (const connector of connectors) {
    if (connector.platform === ConnectorPlatform.Native) {
      continue;
    }

    if (connector.platform === ConnectorPlatform.Web || !connectorMap.has(connector.target)) {
      connectorMap.set(connector.target, connector);
    }
  }

  return [...connectorMap.values()];
};

const truncateSocialUserId = (userId: string) =>
  userId.length <= 14 ? userId : `${userId.slice(0, 8)}...${userId.slice(-4)}`;

const getDisplayProfile = (identity: Identity, fallbackText: string) => {
  const displayName = getSocialIdentityDetail(identity, 'name')?.trim();
  const email = getSocialIdentityDetail(identity, 'email')?.trim();
  const avatar = getSocialIdentityDetail(identity, 'avatar');
  const safeUserId = identity.userId ? truncateSocialUserId(identity.userId) : undefined;
  const primaryText = displayName ?? email ?? safeUserId ?? fallbackText;
  const secondaryText = [email, displayName, safeUserId].find(
    (value) => value && value !== primaryText
  );

  return {
    avatar,
    primaryText,
    secondaryText,
  };
};

const SocialSection = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, theme, userInfo } = useContext(PageContext);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>();

  const socialControl = accountCenterSettings?.fields.social;

  const connectors = useMemo(
    () => filterSocialConnectors(experienceSettings?.socialConnectors ?? []),
    [experienceSettings?.socialConnectors]
  );

  const items = useMemo(
    () =>
      connectors
        .map((connector) => ({
          connector,
          connectorName: getLocalizedConnectorName(connector, language),
          identity: userInfo?.identities?.[connector.target],
        }))
        .slice()
        .sort((left, right) => Number(Boolean(right.identity)) - Number(Boolean(left.identity))),
    [connectors, language, userInfo?.identities]
  );

  const selectedConnector = connectors.find(({ id }) => id === selectedConnectorId);
  const selectedConnectorName =
    selectedConnector && getLocalizedConnectorName(selectedConnector, language);

  if (
    socialControl !== AccountCenterControlValue.Edit &&
    socialControl !== AccountCenterControlValue.ReadOnly
  ) {
    return null;
  }

  if (connectors.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Social sign-in</div>
        <div className={styles.card}>
          {items.map(({ connector, connectorName, identity }) => {
            const profile = identity && getDisplayProfile(identity, connectorName);

            return (
              <div key={connector.id} className={styles.row}>
                <div className={styles.connectorInfo}>
                  <img
                    className={styles.connectorLogo}
                    src={getLogoUrl({
                      theme,
                      logoUrl: connector.logo,
                      darkLogoUrl: connector.logoDark,
                      isApple: connector.target === 'apple',
                    })}
                    alt={connectorName}
                  />
                  <div className={styles.connectorName}>{connectorName}</div>
                </div>
                <div className={styles.identityInfo}>
                  {profile ? (
                    <>
                      {profile.avatar && (
                        <img
                          className={styles.avatar}
                          src={profile.avatar}
                          alt={profile.primaryText}
                        />
                      )}
                      <div className={styles.textGroup}>
                        <div className={styles.primaryText}>{profile.primaryText}</div>
                        {profile.secondaryText && (
                          <div className={styles.secondaryText}>{profile.secondaryText}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={styles.notLinked}>Not linked</div>
                  )}
                </div>
                {socialControl === AccountCenterControlValue.Edit && (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${identity ? styles.removeButton : ''}`}
                      onClick={() => {
                        setRedirectUrl(getRedirectUrl() ?? window.location.href);

                        if (identity) {
                          setSelectedConnectorId(connector.id);
                          return;
                        }

                        navigate(getSocialAddRoute(connector.id));
                      }}
                    >
                      {identity ? 'Remove' : 'Add'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selectedConnector && selectedConnectorName && (
        <ConfirmModal
          isOpen
          title="action.remove"
          confirmText="action.remove"
          confirmButtonType="danger"
          onCancel={() => {
            setSelectedConnectorId(undefined);
          }}
          onConfirm={() => {
            navigate(getSocialRemoveRoute(selectedConnector.id));
            setSelectedConnectorId(undefined);
          }}
        >
          {`If you remove ${selectedConnectorName}, you may not be able to sign in with it until you add it back again.`}
        </ConfirmModal>
      )}
    </>
  );
};

export default SocialSection;
