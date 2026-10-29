import { InlineNotification } from '@experience/components/Notification';
import { AccountCenterControlValue, MfaPolicy } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ConfirmModal from '@ac/components/ConfirmModal';
import ToggleSwitch from '@ac/components/ToggleSwitch';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import {
  hasConfiguredSecondFactor,
  hasEnabledSecondFactor,
  hasVisibleMfaSection,
} from '@ac/utils/security-page';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import { getMfaSettings, updateMfaSettings } from '../../../apis/mfa';
import useApi from '../../../hooks/use-api';
import useErrorHandler from '../../../hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '../../../hooks/use-step-up';
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

type TwoStepVerificationState = 'off' | 'incomplete' | 'on' | 'unknown';

type MfaContentProps = {
  readonly isLoading: boolean;
  readonly hasToggle: boolean;
  readonly twoStepState: TwoStepVerificationState;
  readonly rows: ReturnType<typeof useMfaRows>;
  readonly onToggleChange: (checked: boolean) => Promise<void>;
  readonly onRetry: () => Promise<void>;
};

const getTwoStepState = (
  isPreferred: boolean,
  hasConfiguredFactor: boolean
): TwoStepVerificationState => {
  if (!isPreferred) {
    return 'off';
  }

  return hasConfiguredFactor ? 'on' : 'incomplete';
};

const getTwoStepDescription = (state: TwoStepVerificationState) => {
  switch (state) {
    case 'on': {
      return 'account_center.security.turn_on_2_step_verification_description';
    }
    case 'incomplete': {
      return 'account_center.security.two_step_verification_incomplete_description';
    }
    case 'off': {
      return 'account_center.security.two_step_verification_off_description';
    }
    case 'unknown': {
      return 'account_center.security.two_step_verification_load_failed';
    }
  }
};

const MfaContent = ({
  isLoading,
  hasToggle,
  twoStepState,
  rows,
  onToggleChange,
  onRetry,
}: MfaContentProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <SecuritySkeleton ariaLabel={t('account_center.security.two_step_verification')}>
        <MfaSkeleton hasToggle={hasToggle} rows={rows} />
      </SecuritySkeleton>
    );
  }

  if (twoStepState === 'unknown') {
    return (
      <div className={styles.errorState}>
        <span>{t('account_center.security.two_step_verification_load_failed')}</span>
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => {
            void onRetry();
          }}
        >
          {t('account_center.security.two_step_verification_retry')}
        </button>
      </div>
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
            <div className={styles.toggleDescription}>{t(getTwoStepDescription(twoStepState))}</div>
          </div>
          <ToggleSwitch
            isChecked={twoStepState !== 'off'}
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
  const { accountCenterSettings, experienceSettings, userInfo } = useContext(PageContext);
  const { checkIdentityProof } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
  const {
    mfaVerifications,
    isLoading: isLoadingMfaVerifications,
    hasLoaded: hasLoadedMfaVerifications,
    hasError: hasMfaVerificationsError,
    retry: retryMfaVerifications,
  } = useMfaVerifications();
  const [skipMfaOnSignIn, setSkipMfaOnSignIn] = useState<boolean>();
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>();
  const [hasLoadedMfaSettings, setHasLoadedMfaSettings] = useState(false);
  const [isLoadingMfaSettings, setIsLoadingMfaSettings] = useState(false);
  const [hasMfaSettingsError, setHasMfaSettingsError] = useState(false);
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

  const hasConfiguredMfa = hasConfiguredSecondFactor(
    mfaVerifications,
    experienceSettings,
    userInfo
  );
  // `enabled` is the persisted MFA enablement flag. `undefined` predates the flag, so mirror the
  // backend: the preference only takes effect when the user has a usable factor. An explicit
  // `false` disables MFA verification regardless of `skipMfaOnSignIn`.
  const isTwoStepPreferred = skipMfaOnSignIn === false && (isMfaEnabled ?? hasConfiguredMfa);
  const hasMfaLoadError = hasMfaVerificationsError || (showToggle && hasMfaSettingsError);
  const twoStepState: TwoStepVerificationState = hasMfaLoadError
    ? 'unknown'
    : getTwoStepState(isTwoStepPreferred, hasConfiguredMfa);
  const isMfaSectionLoading =
    (isMfaSectionVisible && (!hasLoadedMfaVerifications || isLoadingMfaVerifications)) ||
    (showToggle && (!hasLoadedMfaSettings || isLoadingMfaSettings));

  const getMfaSettingsRequest = useApi(getMfaSettings, { silent: true });

  const fetchMfaSettings = useCallback(async () => {
    setIsLoadingMfaSettings(true);
    const [error, result] = await getMfaSettingsRequest();
    setHasMfaSettingsError(Boolean(error));
    if (!error && result) {
      setSkipMfaOnSignIn(result.skipMfaOnSignIn);
      setIsMfaEnabled(result.enabled);
    }
    setHasLoadedMfaSettings(true);
    setIsLoadingMfaSettings(false);
  }, [getMfaSettingsRequest]);

  useEffect(() => {
    if (showToggle) {
      void fetchMfaSettings();
    }
  }, [showToggle, fetchMfaSettings]);

  const retryMfa = useCallback(async () => {
    await Promise.all([
      retryMfaVerifications(),
      showToggle ? fetchMfaSettings() : Promise.resolve(),
    ]);
  }, [fetchMfaSettings, retryMfaVerifications, showToggle]);

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
    async (skipMfaOnSignIn: boolean, isResumed = false) => {
      const [error] = await updateMfaSettingsApi({
        skipMfaOnSignIn,
        // Turning verification on must also clear an explicit MFA disablement; otherwise the
        // backend keeps skipping MFA even though the switch is on.
        ...(skipMfaOnSignIn ? {} : { enabled: true }),
      });

      if (error) {
        const action = skipMfaOnSignIn ? 'disable-mfa' : 'enable-mfa';

        if (await requestStepUp(error, { type: action }, { isResumed })) {
          return;
        }

        await handleError(error);
        return;
      }

      setSkipMfaOnSignIn(skipMfaOnSignIn);

      if (!skipMfaOnSignIn) {
        setIsMfaEnabled(true);
      }
    },
    [handleError, requestStepUp, updateMfaSettingsApi]
  );

  const handleToggleChange = useCallback(
    async (checked: boolean) => {
      const skipMfa = !checked;

      if (!checked) {
        setIsConfirmModalOpen(true);
        return;
      }

      if (await checkIdentityProof()) {
        await updateSkipMfaOnSignIn(skipMfa);
        return;
      }

      await startStepUp({ type: 'enable-mfa' });
    },
    [checkIdentityProof, startStepUp, updateSkipMfaOnSignIn]
  );

  const handleConfirmDisable = useCallback(async () => {
    setIsConfirmModalOpen(false);

    if (await checkIdentityProof()) {
      await updateSkipMfaOnSignIn(true);
      return;
    }

    await startStepUp({ type: 'disable-mfa' });
  }, [checkIdentityProof, startStepUp, updateSkipMfaOnSignIn]);

  useEffect(() => {
    const action = consumePendingStepUpAction(['enable-mfa', 'disable-mfa']);

    if (action) {
      void updateSkipMfaOnSignIn(action.type === 'disable-mfa', true);
    }
  }, [updateSkipMfaOnSignIn]);

  if (!shouldShowMfaCard) {
    return null;
  }

  return (
    <>
      <SecuritySection
        title={t('account_center.security.two_step_verification')}
        notification={
          !isMfaSectionLoading && showToggle && twoStepState === 'incomplete' ? (
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
          twoStepState={twoStepState}
          rows={rows}
          onToggleChange={handleToggleChange}
          onRetry={retryMfa}
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
