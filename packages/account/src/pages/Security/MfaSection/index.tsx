import { InlineNotification } from '@experience/components/Notification';
import { AccountCenterControlValue, MfaPolicy } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ConfirmModal from '@ac/components/ConfirmModal';
import ToggleSwitch from '@ac/components/ToggleSwitch';
import { verifiedActionRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import {
  hasConfiguredSecondFactor,
  hasEnabledSecondFactor,
  hasVisibleMfaSection,
} from '@ac/utils/security-page';
import { sessionStorage } from '@ac/utils/session-storage';

import { getMfaSettings, updateMfaSettings } from '../../../apis/mfa';
import useApi from '../../../hooks/use-api';
import useErrorHandler from '../../../hooks/use-error-handler';
import { useMfaVerifications } from '../MfaVerificationsProvider';
import SecurityRow from '../components/SecurityRow';
import SecuritySection from '../components/SecuritySection';
import { SecuritySkeleton } from '../components/SecuritySkeleton';

import MfaSkeleton from './MfaSkeleton';
import styles from './index.module.scss';
import useMfaRows from './use-mfa-rows';

/** MFA policies where users cannot skip MFA verification */
const mandatoryMfaPolicies = new Set<MfaPolicy>([
  MfaPolicy.Mandatory,
  MfaPolicy.PromptAtSignInAndSignUpMandatory,
  MfaPolicy.PromptOnlyAtSignInMandatory,
]);

type MfaContentProps = {
  readonly isLoading: boolean;
  readonly hasToggle: boolean;
  readonly isTwoStepEnabled: boolean;
  readonly rows: ReturnType<typeof useMfaRows>;
  readonly onToggleChange: (checked: boolean) => Promise<void>;
};

const MfaContent = ({
  isLoading,
  hasToggle,
  isTwoStepEnabled,
  rows,
  onToggleChange,
}: MfaContentProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <SecuritySkeleton ariaLabel={t('account_center.security.two_step_verification')}>
        <MfaSkeleton hasToggle={hasToggle} rows={rows} />
      </SecuritySkeleton>
    );
  }

  return (
    <>
      {hasToggle && (
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleTitle}>
              {t('account_center.security.two_step_verification')}
            </div>
            <div className={styles.toggleDescription}>
              {t('account_center.security.turn_on_2_step_verification_description')}
            </div>
          </div>
          <ToggleSwitch
            isChecked={isTwoStepEnabled}
            onChange={(checked) => {
              void onToggleChange(checked);
            }}
          />
        </div>
      )}
      {hasToggle && rows.length > 0 && <div className={styles.divider} />}
      {rows.map((row) => (
        <SecurityRow key={row.key} row={row} />
      ))}
    </>
  );
};

const MfaSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const {
    mfaVerifications,
    isLoading: isLoadingMfaVerifications,
    hasLoaded: hasLoadedMfaVerifications,
  } = useMfaVerifications();
  const [skipMfaOnSignIn, setSkipMfaOnSignIn] = useState<boolean>();
  const [hasLoadedMfaSettings, setHasLoadedMfaSettings] = useState(false);
  const [isLoadingMfaSettings, setIsLoadingMfaSettings] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const handleError = useErrorHandler();

  const updateMfaSettingsApi = useApi(updateMfaSettings);

  const mfaControl = accountCenterSettings?.fields.mfa;
  const mfaPolicy = experienceSettings?.mfa.policy;
  const isEditable = mfaControl === AccountCenterControlValue.Edit;
  const isMfaSectionVisible = hasVisibleMfaSection(mfaControl, experienceSettings);

  const showToggle =
    isEditable &&
    mfaPolicy !== undefined &&
    !mandatoryMfaPolicies.has(mfaPolicy) &&
    hasEnabledSecondFactor(experienceSettings);

  const isTwoStepEnabled = skipMfaOnSignIn === false;
  const hasConfiguredMfa = hasConfiguredSecondFactor(mfaVerifications, experienceSettings);
  const isMfaSectionLoading =
    (isMfaSectionVisible && (!hasLoadedMfaVerifications || isLoadingMfaVerifications)) ||
    (showToggle && (!hasLoadedMfaSettings || isLoadingMfaSettings));

  const getMfaSettingsRequest = useApi(getMfaSettings, { silent: true });

  const fetchMfaSettings = useCallback(async () => {
    setIsLoadingMfaSettings(true);
    const [error, result] = await getMfaSettingsRequest();
    if (!error && result) {
      setSkipMfaOnSignIn(result.skipMfaOnSignIn);
    }
    setHasLoadedMfaSettings(true);
    setIsLoadingMfaSettings(false);
  }, [getMfaSettingsRequest]);

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
  const shouldShowMfaCard = showToggle || rows.length > 0;

  const updateSkipMfaOnSignIn = useCallback(
    async (verifiedId: string, skipMfaOnSignIn: boolean) => {
      const [error] = await updateMfaSettingsApi(verifiedId, { skipMfaOnSignIn });

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      setSkipMfaOnSignIn(skipMfaOnSignIn);
    },
    [handleError, setToast, setVerificationId, t, updateMfaSettingsApi]
  );

  const handleToggleChange = useCallback(
    async (checked: boolean) => {
      const skipMfa = !checked;

      if (!checked) {
        setIsConfirmModalOpen(true);
        return;
      }

      if (verificationId) {
        await updateSkipMfaOnSignIn(verificationId, skipMfa);
        return;
      }

      sessionStorage.setPendingVerifiedAction('enable-mfa');
      navigateTo(verifiedActionRoute);
    },
    [navigateTo, updateSkipMfaOnSignIn, verificationId]
  );

  const handleConfirmDisable = useCallback(async () => {
    setIsConfirmModalOpen(false);

    if (verificationId) {
      await updateSkipMfaOnSignIn(verificationId, true);
      return;
    }

    sessionStorage.setPendingVerifiedAction('disable-mfa');
    navigateTo(verifiedActionRoute);
  }, [navigateTo, updateSkipMfaOnSignIn, verificationId]);

  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const pendingAction = sessionStorage.getPendingVerifiedAction();

    if (pendingAction !== 'enable-mfa' && pendingAction !== 'disable-mfa') {
      return;
    }

    sessionStorage.clearPendingVerifiedAction();
    void updateSkipMfaOnSignIn(verificationId, pendingAction === 'disable-mfa');
  }, [updateSkipMfaOnSignIn, verificationId]);

  if (!shouldShowMfaCard) {
    return null;
  }

  return (
    <>
      <SecuritySection
        title={t('account_center.security.two_step_verification')}
        notification={
          !isMfaSectionLoading && showToggle && isTwoStepEnabled && !hasConfiguredMfa ? (
            <InlineNotification
              message="account_center.security.no_verification_method_warning"
              className={styles.notification}
            />
          ) : undefined
        }
      >
        <MfaContent
          isLoading={isMfaSectionLoading}
          hasToggle={showToggle}
          isTwoStepEnabled={isTwoStepEnabled}
          rows={rows}
          onToggleChange={handleToggleChange}
        />
      </SecuritySection>
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
