import { InlineNotification } from '@experience/components/Notification';
import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import {
  AccountCenterControlValue,
  MfaFactor,
  type Mfa,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  getMfaVerifications,
  generateBackupCodes,
  addBackupCodeMfa,
  deleteMfaVerification,
} from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import StepUpEntryFallback from '@ac/components/StepUpEntryFallback';
import { backupCodesSuccessRoute, backupCodesManageRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useStepUpEntry } from '@ac/hooks/use-step-up';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const isBackupCodeEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.BackupCode) ?? false;

const hasOtherMfaFactor = (mfaVerifications: UserMfaVerificationResponse) => {
  return mfaVerifications.some(({ type }) => type !== MfaFactor.BackupCode);
};

type Props = {
  readonly isRegenerate?: boolean;
};

const BackupCodeBinding = ({ isRegenerate }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, experienceSettings, setToast } = useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications);
  const generateCodesRequest = useApi(generateBackupCodes);
  const addBackupCodeRequest = useApi(addBackupCodeMfa);
  const deleteBackupCodeRequest = useApi(deleteMfaVerification);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();

  const [codes, setCodes] = useState<string[]>();
  const [hasBackupCodeAlready, setHasBackupCodeAlready] = useState<boolean>();
  const [hasOtherMfa, setHasOtherMfa] = useState<boolean>();
  const [existingBackupCodeId, setExistingBackupCodeId] = useState<string>();
  const isPageEnabled =
    Boolean(accountCenterSettings?.enabled) &&
    accountCenterSettings?.fields.mfa === AccountCenterControlValue.Edit &&
    isBackupCodeEnabled(experienceSettings?.mfa);
  const isStepUpEntryEnabled =
    isPageEnabled &&
    hasOtherMfa !== undefined &&
    hasBackupCodeAlready !== undefined &&
    hasOtherMfa &&
    (Boolean(isRegenerate) || !hasBackupCodeAlready);
  const { isReady, hasFailed } = useStepUpEntry({ enabled: isStepUpEntryEnabled });

  // Check if backup code already exists and if other MFA exists on mount
  useEffect(() => {
    const checkExisting = async () => {
      const [error, result] = await getMfaRequest();

      if (error) {
        // If there's an error, we'll let the user continue and the backend will validate
        setHasBackupCodeAlready(false);
        setHasOtherMfa(true);
        return;
      }

      const mfaVerifications = result ?? [];
      const backupCodeVerification = mfaVerifications.find(
        (verification) =>
          verification.type === MfaFactor.BackupCode &&
          verification.remainCodes !== undefined &&
          verification.remainCodes > 0
      );
      const hasBackupCode = Boolean(backupCodeVerification);

      setHasBackupCodeAlready(hasBackupCode);
      setHasOtherMfa(hasOtherMfaFactor(mfaVerifications));

      if (backupCodeVerification) {
        setExistingBackupCodeId(backupCodeVerification.id);
      }

      if (hasBackupCode && !isRegenerate) {
        navigate(backupCodesManageRoute, { replace: true });
      }
    };

    void checkExisting();
  }, [isRegenerate, getMfaRequest, navigate]);

  // Generate backup codes on mount
  useEffect(() => {
    if (
      !isReady ||
      Boolean(codes) ||
      (hasBackupCodeAlready !== false && !isRegenerate) ||
      hasOtherMfa !== true
    ) {
      return;
    }

    const generateCodes = async () => {
      const [error, result] = await generateCodesRequest();

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        setCodes(result.codes);
      }
    };

    void generateCodes();
  }, [
    codes,
    isRegenerate,
    generateCodesRequest,
    handleError,
    hasBackupCodeAlready,
    hasOtherMfa,
    isReady,
  ]);

  const copyText = useCallback(
    async (text: string, successMessage: string) => {
      await navigator.clipboard.writeText(text);
      setToast(successMessage);
    },
    [setToast]
  );

  const downloadText = useCallback((text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    // eslint-disable-next-line @silverhand/fp/no-mutation
    downloadLink.href = URL.createObjectURL(blob);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    downloadLink.download = filename;
    downloadLink.click();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isReady || !codes || loading) {
      return;
    }

    // If regenerating, delete the existing backup codes first
    if (isRegenerate && existingBackupCodeId) {
      const [deleteError] = await deleteBackupCodeRequest(existingBackupCodeId);
      if (deleteError) {
        if (await requestStepUp(deleteError, { type: 'enter-subpage' })) {
          return;
        }

        await handleError(deleteError);
        return;
      }
    }

    const [error] = await addBackupCodeRequest({ codes });

    if (error) {
      if (await requestStepUp(error, { type: 'enter-subpage' })) {
        return;
      }

      await handleError(error, {
        'user.backup_code_already_in_use': async (requestError) => {
          setToast(requestError.message);
        },
        'session.mfa.backup_code_can_not_be_alone': async (requestError) => {
          setToast(requestError.message);
        },
      });
      return;
    }

    navigate(backupCodesSuccessRoute, { replace: true });
  }, [
    addBackupCodeRequest,
    codes,
    deleteBackupCodeRequest,
    existingBackupCodeId,
    handleError,
    isReady,
    isRegenerate,
    loading,
    navigate,
    requestStepUp,
    setToast,
  ]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.mfa !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isBackupCodeEnabled(experienceSettings?.mfa)) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.backup_code_not_enabled"
      />
    );
  }

  if (hasBackupCodeAlready && !isRegenerate) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.backup_code_already_added"
      />
    );
  }

  if (hasOtherMfa === false) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.backup_code_requires_other_mfa"
      />
    );
  }

  if (!isReady) {
    return <StepUpEntryFallback hasFailed={hasFailed} />;
  }

  const backupCodeTextContent = codes?.join('\n') ?? '';

  return (
    <SecondaryPageLayout
      title="mfa.save_backup_code"
      description="mfa.save_backup_code_description"
      notification={
        isRegenerate ? <InlineNotification message="mfa.new_backup_codes_generated" /> : undefined
      }
    >
      <div className={styles.container}>
        <div className={styles.backupCodes}>
          {codes?.map((code) => <span key={code}>{code}</span>)}
        </div>
        <div className={styles.actions}>
          <Button
            title="action.download"
            type="secondary"
            onClick={() => {
              downloadText(backupCodeTextContent, 'backup_code.txt');
            }}
          />
          <Button
            title="action.copy"
            type="secondary"
            onClick={() => {
              void copyText(backupCodeTextContent, t('mfa.backup_code_copied'));
            }}
          />
        </div>
        <div className={styles.hint}>
          <DynamicT forKey="mfa.backup_code_hint" />
        </div>
        <Button
          title="action.continue"
          type="primary"
          className={styles.submitButton}
          isLoading={loading}
          onClick={() => {
            void handleSubmit();
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default BackupCodeBinding;
