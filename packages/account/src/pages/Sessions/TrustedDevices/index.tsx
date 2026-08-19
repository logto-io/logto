import type { AccountTrustedDeviceResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import ConfirmModal from '@ac/components/ConfirmModal';
import { layoutClassNames } from '@ac/constants/layout';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';

import TrustedDeviceRow from './TrustedDeviceRow';
import styles from './index.module.scss';

type Props = {
  readonly hasManageAction: boolean;
  readonly onManage: () => void;
  readonly onPermissionDenied: () => void;
};

const TrustedDevices = ({ hasManageAction, onManage, onPermissionDenied }: Props) => {
  const { t } = useTranslation();
  const { accountCenterSettings, verificationId, setToast } = useContext(PageContext);
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

  const handlePermissionDenied = useCallback(() => {
    setHasLoadingError(false);
    setTrustedDevices(undefined);
    setRemoveTarget(undefined);
    onPermissionDenied();
  }, [onPermissionDenied]);

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
    void fetchTrustedDevices();
  }, [fetchTrustedDevices]);

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
    setToast(t('account_center.sessions.trusted_devices.removed'));
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
      <div className={classNames(styles.section, layoutClassNames.section)}>
        <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
          {t('account_center.sessions.trusted_devices.title')}
        </div>
        <div className={classNames(styles.card, layoutClassNames.card)}>
          {isLoading ? (
            <div className={styles.state}>
              {t('account_center.sessions.trusted_devices.loading')}
            </div>
          ) : hasLoadingError ? (
            <div className={styles.state}>
              <span>{t('account_center.sessions.trusted_devices.load_failed')}</span>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => {
                  void fetchTrustedDevices();
                }}
              >
                {t('account_center.sessions.trusted_devices.retry')}
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
              <div className={styles.state}>
                {t('account_center.sessions.trusted_devices.empty')}
              </div>
            )
          ) : hasManageAction ? (
            <div className={styles.state}>
              <button type="button" className={styles.actionButton} onClick={onManage}>
                {t('account_center.security.manage')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(removeTarget)}
        title="account_center.sessions.trusted_devices.remove_confirmation_title"
        confirmText="account_center.sessions.trusted_devices.remove"
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
        {t('account_center.sessions.trusted_devices.remove_confirmation_description')}
      </ConfirmModal>
    </>
  );
};

export default TrustedDevices;
