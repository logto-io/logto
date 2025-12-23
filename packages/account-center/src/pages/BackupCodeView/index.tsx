import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import { MfaFactor } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  type BackupCodeItem,
  getBackupCodesList,
  getMfaVerifications,
  deleteMfaVerification,
} from '@ac/apis/mfa';
import ConfirmModal from '@ac/components/ConfirmModal';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { backupCodesDeletedRoute, backupCodesGenerateRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const BackupCodeView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { verificationId, setVerificationId, setToast } = useContext(PageContext);
  const getBackupCodesRequest = useApi(getBackupCodesList);
  const getMfaRequest = useApi(getMfaVerifications);
  const deleteBackupCodeRequest = useApi(deleteMfaVerification);
  const handleError = useErrorHandler();

  const [codes, setCodes] = useState<BackupCodeItem[]>();
  const [hasError, setHasError] = useState(false);
  const [backupCodeVerificationId, setBackupCodeVerificationId] = useState<string>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch backup codes and verification ID on mount
  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const fetchData = async () => {
      const [codesError, codesResult] = await getBackupCodesRequest(verificationId);
      if (codesError || !codesResult) {
        setHasError(true);
        return;
      }
      setCodes(codesResult.codes);

      // Get the backup code verification ID for delete operation
      const [mfaError, mfaResult] = await getMfaRequest();
      if (mfaError || !mfaResult) {
        return;
      }
      const backupCodeVerification = mfaResult.find(
        (verification) => verification.type === MfaFactor.BackupCode
      );
      if (backupCodeVerification) {
        setBackupCodeVerificationId(backupCodeVerification.id);
      }
    };

    void fetchData();
  }, [getBackupCodesRequest, getMfaRequest, verificationId]);

  const handleDelete = useCallback(async () => {
    if (!verificationId || !backupCodeVerificationId) {
      return;
    }

    const [error] = await deleteBackupCodeRequest(verificationId, backupCodeVerificationId);
    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
      });
      setShowDeleteConfirm(false);
      return;
    }

    setShowDeleteConfirm(false);
    void navigate(backupCodesDeletedRoute, { replace: true });
  }, [
    backupCodeVerificationId,
    deleteBackupCodeRequest,
    handleError,
    navigate,
    setToast,
    setVerificationId,
    t,
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

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  if (hasError) {
    return <ErrorPage titleKey="error.something_went_wrong" />;
  }

  if (!codes) {
    return null;
  }

  const backupCodeTextContent = codes
    .filter(({ usedAt }) => !usedAt)
    .map(({ code }) => code)
    .join('\n');

  return (
    <>
      <SecondaryPageLayout
        title="account_center.backup_code.title"
        description="account_center.backup_code.description"
      >
        <div className={styles.container}>
          <div className={styles.backupCodes}>
            {codes.map(({ code, usedAt }) => (
              <span key={code} className={usedAt ? styles.used : undefined}>
                {code}
              </span>
            ))}
          </div>
          <div className={styles.actions}>
            <Button
              title="action.download"
              type="secondary"
              size="small"
              onClick={() => {
                downloadText(backupCodeTextContent, 'backup_codes.txt');
              }}
            />
            <Button
              title="action.copy"
              type="secondary"
              size="small"
              onClick={() => {
                void copyText(backupCodeTextContent, t('mfa.backup_code_copied'));
              }}
            />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => {
                setShowDeleteConfirm(true);
              }}
            >
              <DynamicT forKey="action.remove" />
            </button>
          </div>
          <div className={styles.hint}>
            <DynamicT forKey="account_center.backup_code.copy_hint" />
          </div>
          <div className={styles.divider} />
          <div className={styles.generateSection}>
            <div className={styles.generateTitle}>
              <DynamicT forKey="account_center.backup_code.generate_new_title" />
            </div>
            <Button
              title="account_center.backup_code.generate_new"
              type="secondary"
              onClick={() => {
                void navigate(backupCodesGenerateRoute);
              }}
            />
          </div>
        </div>
      </SecondaryPageLayout>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="account_center.backup_code.delete_confirmation_title"
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
      >
        <DynamicT forKey="account_center.backup_code.delete_confirmation_description" />
      </ConfirmModal>
    </>
  );
};

export default BackupCodeView;
