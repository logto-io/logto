import type { AccountTrustedDeviceResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import ConfirmModal from '@ac/components/ConfirmModal';
import { verifiedActionRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '@ac/hooks/use-step-up';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { sessionStorage } from '@ac/utils/session-storage';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import SecuritySection from '../components/SecuritySection';

import TrustedDeviceRow from './TrustedDeviceRow';
import styles from './index.module.scss';

const TrustedDevicesSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, setVerificationId, setToast } = useContext(PageContext);
  const {
    isReady: isIdentityProofReady,
    isChecking: isCheckingIdentityProof,
    verificationId,
    checkIdentityProof,
  } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
  const [trustedDevices, setTrustedDevices] = useState<AccountTrustedDeviceResponse[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AccountTrustedDeviceResponse>();
  const [isRemoving, setIsRemoving] = useState(false);
  const getTrustedDevicesApi = useApi(getTrustedDevices, { silent: true });
  const removeTrustedDeviceApi = useApi(removeTrustedDevice, { silent: true });
  const handleError = useErrorHandler();
  const hasAutoLoadedRef = useRef(false);

  const control = accountCenterSettings?.fields.trustedDevice;
  const isVisible =
    control === AccountCenterControlValue.ReadOnly || control === AccountCenterControlValue.Edit;
  const isEditable = control === AccountCenterControlValue.Edit;
  const isInitialLoading =
    isCheckingIdentityProof || (isIdentityProofReady && !hasLoadingError && !trustedDevices);

  const handlePermissionDenied = useCallback(() => {
    setHasLoadingError(false);
    setTrustedDevices(undefined);
    setRemoveTarget(undefined);
    setVerificationId(undefined);
    setToast(t('account_center.verification.verification_required'));
  }, [setToast, setVerificationId, t]);

  const fetchTrustedDevices = useCallback(
    async (isResumed = false) => {
      if (!isVisible) {
        return;
      }

      setIsLoading(true);
      setHasLoadingError(false);
      const [error, result] = await getTrustedDevicesApi(verificationId);

      if (error) {
        if (await requestStepUp(error, { type: 'load-trusted-devices' }, { isResumed })) {
          return;
        }

        setHasLoadingError(true);
        await handleError(error, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
      } else {
        setTrustedDevices(result ?? []);
      }

      setIsLoading(false);
    },
    [
      getTrustedDevicesApi,
      handleError,
      handlePermissionDenied,
      isVisible,
      requestStepUp,
      verificationId,
    ]
  );

  const removeDevice = useCallback(
    async (trustedDeviceId: string, isResumed = false) => {
      setIsRemoving(true);

      const [error] = await removeTrustedDeviceApi(verificationId, trustedDeviceId);

      if (error) {
        // Keep the confirmation loading until the redirect starts.
        if (
          await requestStepUp(
            error,
            { type: 'remove-trusted-device', trustedDeviceId },
            { isResumed }
          )
        ) {
          return;
        }

        await handleError(error, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
        setIsRemoving(false);
        return;
      }

      if (isResumed) {
        // The confirmed removal runs once after the step-up, then the list reloads with the
        // elevated token.
        setIsRemoving(false);
        await fetchTrustedDevices(true);
        return;
      }

      setTrustedDevices((previous) => previous?.filter(({ id }) => id !== trustedDeviceId));
      setRemoveTarget(undefined);
      setIsRemoving(false);
      setToast(t('account_center.security.trusted_devices.removed'));
    },
    [
      fetchTrustedDevices,
      handleError,
      handlePermissionDenied,
      removeTrustedDeviceApi,
      requestStepUp,
      setToast,
      t,
      verificationId,
    ]
  );

  useEffect(() => {
    if (
      !isVisible ||
      !isIdentityProofReady ||
      isCheckingIdentityProof ||
      trustedDevices !== undefined ||
      hasLoadingError ||
      hasAutoLoadedRef.current
    ) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasAutoLoadedRef.current = true;

    if (verificationId && sessionStorage.getPendingVerifiedAction() === 'load-trusted-devices') {
      sessionStorage.clearPendingVerifiedAction();
    }

    void fetchTrustedDevices();
  }, [
    fetchTrustedDevices,
    hasLoadingError,
    isCheckingIdentityProof,
    isIdentityProofReady,
    isVisible,
    trustedDevices,
    verificationId,
  ]);

  useEffect(() => {
    const action = consumePendingStepUpAction(['load-trusted-devices', 'remove-trusted-device']);

    if (!action) {
      return;
    }

    // The resumed action owns this page load; do not also auto-load the list.
    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasAutoLoadedRef.current = true;

    if (action.type === 'remove-trusted-device') {
      void removeDevice(action.trustedDeviceId, true);
      return;
    }

    void fetchTrustedDevices(true);
  }, [fetchTrustedDevices, removeDevice]);

  const handleManage = useCallback(async () => {
    if (await checkIdentityProof()) {
      await fetchTrustedDevices();
      return;
    }

    if (await startStepUp({ type: 'load-trusted-devices' })) {
      return;
    }

    setPendingReturn(getPendingReturn() ?? window.location.href);
    sessionStorage.setPendingVerifiedAction('load-trusted-devices');
    navigate(verifiedActionRoute);
  }, [checkIdentityProof, fetchTrustedDevices, navigate, startStepUp]);

  const handleConfirmRemove = useCallback(async () => {
    if (!removeTarget) {
      return;
    }

    const trustedDeviceId = removeTarget.id;
    setIsRemoving(true);

    if (await checkIdentityProof()) {
      await removeDevice(trustedDeviceId);
      return;
    }

    if (await startStepUp({ type: 'remove-trusted-device', trustedDeviceId })) {
      return;
    }

    setIsRemoving(false);
  }, [checkIdentityProof, removeDevice, removeTarget, startStepUp]);

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
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                void handleManage();
              }}
            >
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
