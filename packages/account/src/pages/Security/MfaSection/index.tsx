import { InlineNotification } from '@experience/components/Notification';
import {
  AccountCenterControlValue,
  MfaPolicy,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ConfirmModal from '@ac/components/ConfirmModal';
import ToggleSwitch from '@ac/components/ToggleSwitch';
import { isDevFeaturesEnabled } from '@ac/constants/env';
import { layoutClassNames } from '@ac/constants/layout';
import { verifiedActionRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { sessionStorage } from '@ac/utils/session-storage';

import { getMfaSettings, getMfaVerifications, updateMfaSettings } from '../../../apis/mfa';
import useApi from '../../../hooks/use-api';
import useErrorHandler from '../../../hooks/use-error-handler';

import styles from './index.module.scss';
import useMfaRows from './use-mfa-rows';

/** MFA policies where users cannot skip MFA verification */
const mandatoryMfaPolicies = new Set<MfaPolicy>([
  MfaPolicy.Mandatory,
  MfaPolicy.PromptAtSignInAndSignUpMandatory,
  MfaPolicy.PromptOnlyAtSignInMandatory,
]);

const MfaSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, verificationId, setToast } =
    useContext(PageContext);
  const [mfaVerifications, setMfaVerifications] = useState<UserMfaVerificationResponse>();
  const [skipMfaOnSignIn, setSkipMfaOnSignIn] = useState<boolean>();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const handleError = useErrorHandler();

  const updateMfaSettingsApi = useApi(updateMfaSettings);

  const mfaControl = accountCenterSettings?.fields.mfa;
  const enabledFactors = experienceSettings?.mfa.factors ?? [];
  const mfaPolicy = experienceSettings?.mfa.policy;
  const isEditable = mfaControl === AccountCenterControlValue.Edit;

  const showToggle =
    isDevFeaturesEnabled &&
    isEditable &&
    mfaPolicy !== undefined &&
    !mandatoryMfaPolicies.has(mfaPolicy) &&
    enabledFactors.length > 0;

  const isTwoStepEnabled = skipMfaOnSignIn === false;
  const hasConfiguredMfa = (mfaVerifications?.length ?? 0) > 0;

  const getMfaRequest = useApi(getMfaVerifications, { silent: true });
  const getMfaSettingsRequest = useApi(getMfaSettings, { silent: true });

  const fetchMfaVerifications = useCallback(async () => {
    const [error, result] = await getMfaRequest();
    if (!error && result) {
      setMfaVerifications(result);
    }
  }, [getMfaRequest]);

  const fetchMfaSettings = useCallback(async () => {
    const [error, result] = await getMfaSettingsRequest();
    if (!error && result) {
      setSkipMfaOnSignIn(result.skipMfaOnSignIn);
    }
  }, [getMfaSettingsRequest]);

  useEffect(() => {
    void fetchMfaVerifications();
  }, [fetchMfaVerifications]);

  useEffect(() => {
    if (showToggle) {
      void fetchMfaSettings();
    }
  }, [showToggle, fetchMfaSettings]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const rows = useMfaRows(mfaVerifications, navigateTo);

  const handleToggleChange = useCallback(
    async (checked: boolean) => {
      const skipMfa = !checked;

      if (!checked) {
        setIsConfirmModalOpen(true);
        return;
      }

      if (verificationId) {
        const [error] = await updateMfaSettingsApi(verificationId, { skipMfaOnSignIn: skipMfa });

        if (error) {
          await handleError(error, {
            'verification_record.permission_denied': async () => {
              setToast(t('account_center.verification.verification_required'));
            },
          });
          return;
        }

        setSkipMfaOnSignIn(skipMfa);
        return;
      }

      sessionStorage.setPendingVerifiedAction('enable-mfa');
      navigateTo(verifiedActionRoute);
    },
    [verificationId, updateMfaSettingsApi, handleError, setToast, t, navigateTo]
  );

  const handleConfirmDisable = useCallback(async () => {
    setIsConfirmModalOpen(false);

    if (verificationId) {
      const [error] = await updateMfaSettingsApi(verificationId, { skipMfaOnSignIn: true });

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      setSkipMfaOnSignIn(true);
      return;
    }

    sessionStorage.setPendingVerifiedAction('disable-mfa');
    navigateTo(verifiedActionRoute);
  }, [verificationId, updateMfaSettingsApi, handleError, setToast, t, navigateTo]);

  if (rows.length === 0 && !showToggle) {
    return null;
  }

  return (
    <>
      <div className={classNames(styles.section, layoutClassNames.section)}>
        <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
          {t('account_center.security.two_step_verification')}
        </div>
        {showToggle && isTwoStepEnabled && !hasConfiguredMfa && (
          <InlineNotification
            message="account_center.security.no_verification_method_warning"
            className={styles.notification}
          />
        )}
        {(showToggle || rows.length > 0) && (
          <div className={classNames(styles.card, layoutClassNames.card)}>
            {showToggle && (
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <div className={styles.toggleTitle}>
                    {t(
                      isTwoStepEnabled
                        ? 'account_center.security.turn_off_2_step_verification'
                        : 'account_center.security.turn_on_2_step_verification'
                    )}
                  </div>
                  <div className={styles.toggleDescription}>
                    {t(
                      isTwoStepEnabled
                        ? 'account_center.security.turn_off_2_step_verification_description'
                        : 'account_center.security.turn_on_2_step_verification_description'
                    )}
                  </div>
                </div>
                <ToggleSwitch
                  isChecked={isTwoStepEnabled}
                  onChange={(checked) => {
                    void handleToggleChange(checked);
                  }}
                />
              </div>
            )}
            {showToggle && rows.length > 0 && <div className={styles.divider} />}
            {rows.map(({ key, icon: Icon, label, value, isPlainValue, isConfigured, action }) => (
              <div key={key} className={classNames(styles.row, layoutClassNames.row)}>
                <div className={styles.topLine}>
                  <div className={styles.iconWrap}>
                    <Icon className={styles.icon} />
                  </div>
                  {action && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={action.handler}
                      >
                        {action.label}
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.title}>{label}</div>
                <div className={styles.value}>
                  {isConfigured ? (
                    isPlainValue ? (
                      <span className={styles.plainValue}>{value}</span>
                    ) : (
                      <span className={styles.statusTag}>
                        <span className={styles.statusDot} />
                        {value}
                      </span>
                    )
                  ) : (
                    <span className={styles.notConfigured}>
                      {t('account_center.security.not_configured')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="account_center.security.turn_off_2_step_verification"
        confirmText="account_center.security.disable_2_step_verification"
        confirmButtonType="danger"
        cancelText="action.cancel"
        onConfirm={() => {
          void handleConfirmDisable();
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
        }}
      >
        {t('account_center.security.turn_off_2_step_verification_description')}
      </ConfirmModal>
    </>
  );
};

export default MfaSection;
