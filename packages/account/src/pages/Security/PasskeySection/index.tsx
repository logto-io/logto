import { MfaFactor } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import WebAuthnIcon from '@ac/assets/icons/factor-webauthn.svg?react';
import ToggleSwitch from '@ac/components/ToggleSwitch';
import { passkeyAddRoute, passkeyManageRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import {
  getPasskeyFieldControl,
  hasVisiblePasskeySection,
  isEditableField,
} from '@ac/utils/security-page';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import { getLogtoConfig, updateLogtoConfig } from '../../../apis/logto-config';
import useApi from '../../../hooks/use-api';
import useErrorHandler from '../../../hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '../../../hooks/use-step-up';
import { useMfaVerifications } from '../MfaVerificationsProvider';
import SecurityRow, { type SecurityRowData } from '../components/SecurityRow';
import SecuritySection from '../components/SecuritySection';
import { SecurityRowSkeleton, SecuritySkeleton } from '../components/SecuritySkeleton';

import styles from './index.module.scss';

const PasskeySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings } = useContext(PageContext);
  const { checkIdentityProof } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
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
    async (skipped: boolean, isResumed = false) => {
      const [error] = await updateLogtoConfigApi({ passkeySignIn: { skipped } });

      if (error) {
        const action = skipped ? 'disable-passkey-prompt' : 'enable-passkey-prompt';

        if (await requestStepUp(error, { type: action }, { isResumed })) {
          return;
        }

        await handleError(error);
        return;
      }

      setPasskeySignInSkipped(skipped);
    },
    [handleError, requestStepUp, updateLogtoConfigApi]
  );

  const handleToggleChange = useCallback(
    async (checked: boolean) => {
      const skipped = !checked;

      if (await checkIdentityProof()) {
        await updatePasskeySignInSkipped(skipped);
        return;
      }

      const action = checked ? 'enable-passkey-prompt' : 'disable-passkey-prompt';

      await startStepUp({ type: action });
    },
    [checkIdentityProof, startStepUp, updatePasskeySignInSkipped]
  );

  useEffect(() => {
    const action = consumePendingStepUpAction(['enable-passkey-prompt', 'disable-passkey-prompt']);

    if (action) {
      void updatePasskeySignInSkipped(action.type === 'disable-passkey-prompt', true);
    }
  }, [updatePasskeySignInSkipped]);

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
