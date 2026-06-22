import { MfaFactor } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import WebAuthnIcon from '@ac/assets/icons/factor-webauthn.svg?react';
import ToggleSwitch from '@ac/components/ToggleSwitch';
import { passkeyAddRoute, passkeyManageRoute, verifiedActionRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import {
  getPasskeyFieldControl,
  hasVisiblePasskeySection,
  isEditableField,
} from '@ac/utils/security-page';
import { sessionStorage } from '@ac/utils/session-storage';

import { getLogtoConfig, updateLogtoConfig } from '../../../apis/logto-config';
import useApi from '../../../hooks/use-api';
import useErrorHandler from '../../../hooks/use-error-handler';
import { useMfaVerifications } from '../MfaVerificationsProvider';
import SecurityRow, { type SecurityRowData } from '../components/SecurityRow';
import SecuritySection from '../components/SecuritySection';
import { SecurityRowSkeleton, SecuritySkeleton } from '../components/SecuritySkeleton';

import styles from './index.module.scss';

const PasskeySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const { mfaVerifications, isLoading, hasLoaded } = useMfaVerifications();
  const handleError = useErrorHandler();

  const [passkeySignInSkipped, setPasskeySignInSkipped] = useState<boolean>();
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  const getLogtoConfigRequest = useApi(getLogtoConfig, { silent: true });
  const updateLogtoConfigApi = useApi(updateLogtoConfig);

  const passkeyControl = getPasskeyFieldControl(
    accountCenterSettings?.fields.passkey,
    accountCenterSettings?.fields.mfa
  );
  const isEditable = isEditableField(passkeyControl);
  const isSectionVisible = hasVisiblePasskeySection(passkeyControl, experienceSettings);
  const showToggle = isSectionVisible && isEditable;
  const isPromptEnabled = passkeySignInSkipped === false;
  const isSectionLoading =
    (isSectionVisible && (!hasLoaded || isLoading)) ||
    (showToggle && (!hasLoadedConfig || isLoadingConfig));

  const fetchLogtoConfig = useCallback(async () => {
    setIsLoadingConfig(true);
    const [error, result] = await getLogtoConfigRequest();
    if (!error && result) {
      setPasskeySignInSkipped(result.passkeySignIn.skipped);
    }
    setHasLoadedConfig(true);
    setIsLoadingConfig(false);
  }, [getLogtoConfigRequest]);

  useEffect(() => {
    if (showToggle) {
      void fetchLogtoConfig();
    }
  }, [showToggle, fetchLogtoConfig]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const updatePasskeySignInSkipped = useCallback(
    async (verifiedId: string, skipped: boolean) => {
      const [error] = await updateLogtoConfigApi(verifiedId, { passkeySignIn: { skipped } });

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      setPasskeySignInSkipped(skipped);
    },
    [handleError, setToast, setVerificationId, t, updateLogtoConfigApi]
  );

  const handleToggleChange = useCallback(
    async (checked: boolean) => {
      const skipped = !checked;

      if (verificationId) {
        await updatePasskeySignInSkipped(verificationId, skipped);
        return;
      }

      sessionStorage.setPendingVerifiedAction(
        checked ? 'enable-passkey-prompt' : 'disable-passkey-prompt'
      );
      navigateTo(verifiedActionRoute);
    },
    [navigateTo, updatePasskeySignInSkipped, verificationId]
  );

  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const pendingAction = sessionStorage.getPendingVerifiedAction();

    if (pendingAction !== 'enable-passkey-prompt' && pendingAction !== 'disable-passkey-prompt') {
      return;
    }

    sessionStorage.clearPendingVerifiedAction();
    void updatePasskeySignInSkipped(verificationId, pendingAction === 'disable-passkey-prompt');
  }, [updatePasskeySignInSkipped, verificationId]);

  if (!isSectionVisible) {
    return null;
  }

  const passkeyCount =
    mfaVerifications?.filter((verification) => verification.type === MfaFactor.WebAuthn).length ??
    0;
  const isConfigured = passkeyCount > 0;

  const passkeyRow: SecurityRowData = {
    key: 'passkey',
    icon: WebAuthnIcon,
    label: t('account_center.security.passkeys'),
    value: isConfigured
      ? t('account_center.security.passkeys_count', { count: passkeyCount })
      : undefined,
    isConfigured,
    action: isEditable
      ? {
          label: isConfigured
            ? t('account_center.security.manage')
            : t('account_center.security.add'),
          handler: () => {
            navigateTo(isConfigured ? passkeyManageRoute : passkeyAddRoute);
          },
        }
      : undefined,
  };

  if (isSectionLoading) {
    return (
      <SecuritySection title={t('account_center.security.passkeys')}>
        <SecuritySkeleton ariaLabel={t('account_center.security.passkeys')}>
          {showToggle && (
            <>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <div className={classNames(styles.skeletonBlock, styles.skeletonToggleTitle)} />
                  <div
                    className={classNames(styles.skeletonBlock, styles.skeletonToggleDescription)}
                  />
                </div>
                <div className={classNames(styles.skeletonBlock, styles.skeletonSwitch)} />
              </div>
              <div className={styles.divider} />
            </>
          )}
          <SecurityRowSkeleton hasAction={isEditable} />
        </SecuritySkeleton>
      </SecuritySection>
    );
  }

  return (
    <SecuritySection title={t('account_center.security.passkeys')}>
      {showToggle && (
        <>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <div className={styles.toggleTitle}>
                {t('account_center.security.passkey_sign_in_prompt')}
              </div>
              <div className={styles.toggleDescription}>
                {t('account_center.security.passkey_sign_in_prompt_description')}
              </div>
            </div>
            <ToggleSwitch
              isChecked={isPromptEnabled}
              ariaLabel={t('account_center.security.passkey_sign_in_prompt')}
              onChange={(checked) => {
                void handleToggleChange(checked);
              }}
            />
          </div>
          <div className={styles.divider} />
        </>
      )}
      <SecurityRow row={passkeyRow} />
    </SecuritySection>
  );
};

export default PasskeySection;
