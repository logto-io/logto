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
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { backupCodesSuccessRoute, backupCodesManageRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
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
  const { accountCenterSettings, experienceSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications);
  const generateCodesRequest = useApi(generateBackupCodes);
  const addBackupCodeRequest = useApi(addBackupCodeMfa);
  const deleteBackupCodeRequest = useApi(deleteMfaVerification);
  const handleError = useErrorHandler();

  const [codes, setCodes] = useState<string[]>();
  const [hasBackupCodeAlready, setHasBackupCodeAlready] = useState<boolean>();
  const [hasOtherMfa, setHasOtherMfa] = useState<boolean>();
  const [existingBackupCodeId, setExistingBackupCodeId] = useState<string>();

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
        void navigate(backupCodesManageRoute, { replace: true });
      }
    };

    void checkExisting();
  }, [isRegenerate, getMfaRequest, navigate]);

  // Generate backup codes on mount
  useEffect(() => {
    if (
      !verificationId ||
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
    verificationId,
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
    if (!verificationId || !codes || loading) {
      return;
    }

    // If regenerating, delete the existing backup codes first
    if (isRegenerate && existingBackupCodeId) {
      const [deleteError] = await deleteBackupCodeRequest(verificationId, existingBackupCodeId);
      if (deleteError) {
        await handleError(deleteError, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }
    }

    const [error] = await addBackupCodeRequest(verificationId, { codes });

    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
        'user.backup_code_already_in_use': async (requestError) => {
          setToast(requestError.message);
        },
        'session.mfa.backup_code_can_not_be_alone': async (requestError) => {
          setToast(requestError.message);
        },
      });
      return;
    }

    void navigate(backupCodesSuccessRoute, { replace: true });
  }, [
    addBackupCodeRequest,
    codes,
    deleteBackupCodeRequest,
    existingBackupCodeId,
    handleError,
    isRegenerate,
    loading,
    navigate,
    setToast,
    setVerificationId,
    t,
    verificationId,
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

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  const backupCodeTextContent = codes?.join('\n') ?? '';

  return (
    <SecondaryPageLayout
      title="mfa.save_backup_code"
      description="mfa.save_backup_code_description"
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
