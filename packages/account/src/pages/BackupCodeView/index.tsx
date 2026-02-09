import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import { AccountCenterControlValue, MfaFactor, type Mfa } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { type BackupCodeItem, getBackupCodesList } from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { backupCodesRegenerateRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const isBackupCodeEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.BackupCode) ?? false;

const BackupCodeView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, verificationId, setToast } =
    useContext(PageContext);
  const getBackupCodesRequest = useApi(getBackupCodesList);

  const [codes, setCodes] = useState<BackupCodeItem[]>();
  const [hasError, setHasError] = useState(false);

  // Fetch backup codes on mount
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
    };

    void fetchData();
  }, [getBackupCodesRequest, verificationId]);

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
            onClick={() => {
              downloadText(backupCodeTextContent, 'backup_codes.txt');
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
              navigate(backupCodesRegenerateRoute);
            }}
          />
        </div>
      </div>
    </SecondaryPageLayout>
  );
};

export default BackupCodeView;
