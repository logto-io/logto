import DynamicT from '@experience/shared/components/DynamicT';
import { getLogoUrl } from '@experience/shared/utils/logo';
import { AccountCenterControlValue, type Identity } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { deleteSocialIdentity } from '@ac/apis/social';
import ConfirmModal from '@ac/components/ConfirmModal';
import { layoutClassNames } from '@ac/constants/layout';
import { getSocialAddRoute, getSocialChangeRoute, verifiedActionRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { hasVisibleSocialSection } from '@ac/utils/security-page';
import {
  getAvailableSocialConnectors,
  getLocalizedConnectorName,
} from '@ac/utils/social-connector';
import { sessionStorage } from '@ac/utils/session-storage';

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
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const {
    accountCenterSettings,
    experienceSettings,
    theme,
    userInfo,
    verificationId,
    setVerificationId,
    refreshUserInfo,
    setToast,
  } = useContext(PageContext);
  const handleError = useErrorHandler();
  const deleteSocialIdentityRequest = useApi(deleteSocialIdentity);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>();

  const socialControl = accountCenterSettings?.fields.social;

  const connectors = useMemo(
    () => getAvailableSocialConnectors(experienceSettings?.socialConnectors ?? []),
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
  const currentPageUrl = `${window.location.origin}${window.location.pathname}`;

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const removeSocialIdentityForConnector = useCallback(
    async (connectorId: string, verifiedId: string) => {
      const connector = connectors.find(({ id }) => id === connectorId);

      if (!connector) {
        return;
      }

      const connectorName = getLocalizedConnectorName(connector, language);
      const [error] = await deleteSocialIdentityRequest(verifiedId, connector.target);

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      await refreshUserInfo();
      setToast(t('account_center.social.removed', { connector: connectorName }));
    },
    [
      connectors,
      deleteSocialIdentityRequest,
      handleError,
      language,
      refreshUserInfo,
      setToast,
      setVerificationId,
      t,
    ]
  );

  const handleRemoveConfirm = useCallback(async () => {
    if (!selectedConnectorId) {
      return;
    }

    const connectorId = selectedConnectorId;
    setSelectedConnectorId(undefined);

    if (verificationId) {
      await removeSocialIdentityForConnector(connectorId, verificationId);
      return;
    }

    sessionStorage.setPendingVerifiedAction('remove-social');
    sessionStorage.setPendingSocialRemoveConnectorId(connectorId);
    navigateTo(verifiedActionRoute);
  }, [navigateTo, removeSocialIdentityForConnector, selectedConnectorId, verificationId]);

  useEffect(() => {
    if (!verificationId) {
      return;
    }

    if (sessionStorage.getPendingVerifiedAction() !== 'remove-social') {
      return;
    }

    const connectorId = sessionStorage.getPendingSocialRemoveConnectorId();

    if (!connectorId) {
      return;
    }

    sessionStorage.clearPendingVerifiedAction();
    sessionStorage.clearPendingSocialRemoveConnectorId();
    void removeSocialIdentityForConnector(connectorId, verificationId);
  }, [removeSocialIdentityForConnector, verificationId]);

  if (!hasVisibleSocialSection(socialControl, experienceSettings)) {
    return null;
  }

  return (
    <>
      <div className={classNames(styles.section, layoutClassNames.section)}>
        <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
          {t('account_center.security.social_sign_in')}
        </div>
        <div className={classNames(styles.card, layoutClassNames.card)}>
          {items.map(({ connector, connectorName, identity }) => {
            const profile = identity && getDisplayProfile(identity, connectorName);

            return (
              <div key={connector.id} className={classNames(styles.row, layoutClassNames.row)}>
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
                    <div className={styles.notLinked}>
                      {t('account_center.security.social_not_linked')}
                    </div>
                  )}
                </div>
                {socialControl === AccountCenterControlValue.Edit && (
                  <div className={styles.actions}>
                    {identity ? (
                      <>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => {
                            setPendingReturn(getPendingReturn() ?? currentPageUrl);
                            navigate(getSocialChangeRoute(connector.id));
                          }}
                        >
                          {t('account_center.security.change')}
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.removeButton}`}
                          onClick={() => {
                            setSelectedConnectorId(connector.id);
                          }}
                        >
                          {t('account_center.security.remove')}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          setPendingReturn(getPendingReturn() ?? currentPageUrl);
                          navigate(getSocialAddRoute(connector.id));
                        }}
                      >
                        {t('account_center.security.add')}
                      </button>
                    )}
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
            void handleRemoveConfirm();
          }}
        >
          <DynamicT
            forKey="account_center.social.remove_confirmation_description"
            interpolation={{ connector: selectedConnectorName }}
          />
        </ConfirmModal>
      )}
    </>
  );
};

export default SocialSection;
