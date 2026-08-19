import type { AccountTrustedDeviceResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import ConfirmModal from '@ac/components/ConfirmModal';
import { verifiedActionRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { sessionStorage } from '@ac/utils/session-storage';

import SecuritySection from '../components/SecuritySection';

import TrustedDeviceRow from './TrustedDeviceRow';
import styles from './index.module.scss';

const TrustedDevicesSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const [trustedDevices, setTrustedDevices] = useState<AccountTrustedDeviceResponse[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AccountTrustedDeviceResponse>();
  const [isRemoving, setIsRemoving] = useState(false);
  const getTrustedDevicesApi = useApi(getTrustedDevices, { silent: true });
  const removeTrustedDeviceApi = useApi(removeTrustedDevice, { silent: true });
  const handleError = useErrorHandler();

  const control = accountCenterSettings?.fields.trustedDevice;
  const isVisible =
    control === AccountCenterControlValue.ReadOnly || control === AccountCenterControlValue.Edit;
  const isEditable = control === AccountCenterControlValue.Edit;
  const isInitialLoading = Boolean(verificationId) && !hasLoadingError && !trustedDevices;

  const handlePermissionDenied = useCallback(() => {
    setHasLoadingError(false);
    setTrustedDevices(undefined);
    setRemoveTarget(undefined);
    setVerificationId(undefined);
    setToast(t('account_center.verification.verification_required'));
  }, [setToast, setVerificationId, t]);

  const fetchTrustedDevices = useCallback(async () => {
    if (!verificationId || !isVisible) {
      return;
    }

    setIsLoading(true);
    setHasLoadingError(false);
    const [error, result] = await getTrustedDevicesApi(verificationId);

    if (error) {
      setHasLoadingError(true);
      await handleError(error, {
        'verification_record.permission_denied': handlePermissionDenied,
      });
    } else {
      setTrustedDevices(result ?? []);
    }

    setIsLoading(false);
  }, [getTrustedDevicesApi, handleError, handlePermissionDenied, isVisible, verificationId]);

  useEffect(() => {
    if (!verificationId) {
      return;
    }

    if (sessionStorage.getPendingVerifiedAction() === 'load-trusted-devices') {
      sessionStorage.clearPendingVerifiedAction();
    }

    void fetchTrustedDevices();
  }, [fetchTrustedDevices, verificationId]);

  const handleManage = useCallback(() => {
    setPendingReturn(getPendingReturn() ?? window.location.href);
    sessionStorage.setPendingVerifiedAction('load-trusted-devices');
    navigate(verifiedActionRoute);
  }, [navigate]);

  const handleConfirmRemove = useCallback(async () => {
    if (!verificationId || !removeTarget) {
      return;
    }

    setIsRemoving(true);
    const [error] = await removeTrustedDeviceApi(verificationId, removeTarget.id);

    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': handlePermissionDenied,
      });
      setIsRemoving(false);
      return;
    }

    setTrustedDevices((previous) => previous?.filter(({ id }) => id !== removeTarget.id));
    setRemoveTarget(undefined);
    setIsRemoving(false);
    setToast(t('account_center.security.trusted_devices.removed'));
  }, [
    handleError,
    handlePermissionDenied,
    removeTarget,
    removeTrustedDeviceApi,
    setToast,
    t,
    verificationId,
  ]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <SecuritySection title={t('account_center.security.trusted_devices.title')}>
        {isLoading || isInitialLoading ? (
          <div className={styles.state}>{t('account_center.security.trusted_devices.loading')}</div>
        ) : hasLoadingError ? (
          <div className={styles.state}>
            <span>{t('account_center.security.trusted_devices.load_failed')}</span>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                void fetchTrustedDevices();
              }}
            >
              {t('account_center.security.trusted_devices.retry')}
            </button>
          </div>
        ) : trustedDevices ? (
          trustedDevices.length > 0 ? (
            trustedDevices.map((trustedDevice) => (
              <TrustedDeviceRow
                key={trustedDevice.id}
                trustedDevice={trustedDevice}
                isEditable={isEditable}
                onRemove={() => {
                  setRemoveTarget(trustedDevice);
                }}
              />
            ))
          ) : (
            <div className={styles.state}>{t('account_center.security.trusted_devices.empty')}</div>
          )
        ) : (
          <div className={styles.state}>
            <button type="button" className={styles.actionButton} onClick={handleManage}>
              {t('account_center.security.manage')}
            </button>
          </div>
        )}
      </SecuritySection>

      <ConfirmModal
        isOpen={Boolean(removeTarget)}
        title="account_center.security.trusted_devices.remove_confirmation_title"
        confirmText="account_center.security.trusted_devices.remove"
        confirmButtonType="danger"
        cancelText="action.cancel"
        isLoading={isRemoving}
        onConfirm={() => {
          void handleConfirmRemove();
        }}
        onCancel={() => {
          if (!isRemoving) {
            setRemoveTarget(undefined);
          }
        }}
      >
        {t('account_center.security.trusted_devices.remove_confirmation_description')}
      </ConfirmModal>
    </>
  );
};

export default TrustedDevicesSection;
