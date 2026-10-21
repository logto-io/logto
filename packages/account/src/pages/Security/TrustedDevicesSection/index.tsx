import type { AccountTrustedDeviceResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import ConfirmModal from '@ac/components/ConfirmModal';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '@ac/hooks/use-step-up';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import SecuritySection from '../components/SecuritySection';

import TrustedDeviceRow from './TrustedDeviceRow';
import styles from './index.module.scss';

const TrustedDevicesSection = () => {
  const { t } = useTranslation();
  const { accountCenterSettings, setToast } = useContext(PageContext);
  const {
    isReady: isIdentityProofReady,
    isChecking: isCheckingIdentityProof,
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

  const fetchTrustedDevices = useCallback(
    async (isResumed = false) => {
      if (!isVisible) {
        return;
      }

      setIsLoading(true);
      setHasLoadingError(false);
      const [error, result] = await getTrustedDevicesApi();

      if (error) {
        if (await requestStepUp(error, { type: 'load-trusted-devices' }, { isResumed })) {
          return;
        }

        setHasLoadingError(true);
        await handleError(error);
      } else {
        setTrustedDevices(result ?? []);
      }

      setIsLoading(false);
    },
    [getTrustedDevicesApi, handleError, isVisible, requestStepUp]
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

    void fetchTrustedDevices();
  }, [
    fetchTrustedDevices,
    hasLoadingError,
    isCheckingIdentityProof,
    isIdentityProofReady,
    isVisible,
    trustedDevices,
  ]);

  useEffect(() => {
    if (consumePendingStepUpAction(['load-trusted-devices'])) {
      // The resumed action owns this page load; do not also auto-load the list.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasAutoLoadedRef.current = true;
      void fetchTrustedDevices(true);
    }
  }, [fetchTrustedDevices]);

  const handleManage = useCallback(async () => {
    if (await checkIdentityProof()) {
      await fetchTrustedDevices();
      return;
    }

    await startStepUp({ type: 'load-trusted-devices' });
  }, [checkIdentityProof, fetchTrustedDevices, startStepUp]);

  const handleConfirmRemove = useCallback(async () => {
    if (!removeTarget) {
      return;
    }

    setIsRemoving(true);

    if (!isIdentityProofReady) {
      await startStepUp({ type: 'load-trusted-devices' });
      return;
    }

    const [error] = await removeTrustedDeviceApi(removeTarget.id);

    if (error) {
      // The removal is not replayed after the step-up; the user confirms it again on the reloaded
      // list. Keep the confirmation loading until the redirect starts.
      if (await requestStepUp(error, { type: 'load-trusted-devices' })) {
        return;
      }

      await handleError(error);
      setIsRemoving(false);
      return;
    }

    setTrustedDevices((previous) => previous?.filter(({ id }) => id !== removeTarget.id));
    setRemoveTarget(undefined);
    setIsRemoving(false);
    setToast(t('account_center.security.trusted_devices.removed'));
  }, [
    handleError,
    isIdentityProofReady,
    removeTarget,
    removeTrustedDeviceApi,
    requestStepUp,
    startStepUp,
    setToast,
    t,
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
