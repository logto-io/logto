import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import InputField from '@experience/shared/components/InputFields/InputField';
import {
  AccountCenterControlValue,
  MfaFactor,
  type Mfa,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { format } from 'date-fns';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getMfaVerifications, deleteMfaVerification, updateWebAuthnName } from '@ac/apis/mfa';
import ConfirmModal from '@ac/components/ConfirmModal';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { passkeyDeletedRoute, passkeyAddRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { formatPasskeyName } from '@ac/utils/passkey';

import styles from './index.module.scss';

type PasskeyInfo = {
  id: string;
  name?: string;
  agent?: string;
  createdAt: string;
  lastUsedAt?: string;
};

const isWebAuthnEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.WebAuthn) ?? false;

const formatDate = (dateString: string): string => format(new Date(dateString), 'MMMM d, yyyy');

const PasskeyView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications);
  const deletePasskeyRequest = useApi(deleteMfaVerification);
  const updatePasskeyNameRequest = useApi(updateWebAuthnName);
  const handleError = useErrorHandler();

  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>();
  const [hasError, setHasError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyInfo>();
  const [editName, setEditName] = useState('');

  // Fetch passkeys on mount
  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const fetchData = async () => {
      const [error, result] = await getMfaRequest();
      if (error || !result) {
        setHasError(true);
        return;
      }

      const webAuthnVerifications: UserMfaVerificationResponse = result.filter(
        (verification) => verification.type === MfaFactor.WebAuthn
      );

      setPasskeys(
        webAuthnVerifications.map((verification) => ({
          id: verification.id,
          name: verification.name,
          agent: verification.agent,
          createdAt: verification.createdAt,
          lastUsedAt: verification.lastUsedAt,
        }))
      );
    };

    void fetchData();
  }, [getMfaRequest, verificationId]);

  const handleDelete = useCallback(async () => {
    if (!verificationId || !selectedPasskey) {
      return;
    }

    const [error] = await deletePasskeyRequest(verificationId, selectedPasskey.id);
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
    void navigate(passkeyDeletedRoute, { replace: true });
  }, [
    deletePasskeyRequest,
    handleError,
    navigate,
    selectedPasskey,
    setToast,
    setVerificationId,
    t,
    verificationId,
  ]);

  const handleEditSubmit = useCallback(async () => {
    if (!verificationId || !selectedPasskey || !editName.trim()) {
      return;
    }

    const [error] = await updatePasskeyNameRequest(
      verificationId,
      selectedPasskey.id,
      editName.trim()
    );
    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
      });
      setShowEditModal(false);
      return;
    }

    // Update local state
    setPasskeys((previous) =>
      previous?.map((passkey) =>
        passkey.id === selectedPasskey.id ? { ...passkey, name: editName.trim() } : passkey
      )
    );
    setShowEditModal(false);
    setToast(t('account_center.passkey.renamed'));
  }, [
    editName,
    handleError,
    selectedPasskey,
    setToast,
    setVerificationId,
    t,
    updatePasskeyNameRequest,
    verificationId,
  ]);

  const passkeyDisplayName = useMemo(() => {
    if (!selectedPasskey) {
      return '';
    }
    return (
      formatPasskeyName(selectedPasskey.name, selectedPasskey.agent) ??
      t('account_center.passkey.unnamed')
    );
  }, [selectedPasskey, t]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.mfa !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isWebAuthnEnabled(experienceSettings?.mfa)) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.passkey_not_enabled"
      />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  if (hasError) {
    return <ErrorPage titleKey="error.something_went_wrong" />;
  }

  if (!passkeys) {
    return null;
  }

  return (
    <>
      <SecondaryPageLayout title="account_center.passkey.title">
        <div className={styles.container}>
          <div className={styles.passkeyList}>
            {passkeys.map((passkey) => {
              const displayName =
                formatPasskeyName(passkey.name, passkey.agent) ??
                t('account_center.passkey.unnamed');
              return (
                <div key={passkey.id} className={styles.passkeyItem}>
                  <div className={styles.passkeyInfo}>
                    <div className={styles.passkeyName}>{displayName}</div>
                    <div className={styles.passkeyMeta}>
                      <DynamicT
                        forKey="account_center.passkey.added"
                        interpolation={{ date: formatDate(passkey.createdAt) }}
                      />
                    </div>
                    <div className={styles.passkeyMeta}>
                      <DynamicT
                        forKey="account_center.passkey.last_used"
                        interpolation={{
                          date: passkey.lastUsedAt
                            ? formatDate(passkey.lastUsedAt)
                            : t('account_center.passkey.never_used'),
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.passkeyActions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => {
                        setSelectedPasskey(passkey);
                        setEditName(formatPasskeyName(passkey.name, passkey.agent) ?? '');
                        setShowEditModal(true);
                      }}
                    >
                      <DynamicT forKey="action.edit" />
                    </button>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => {
                        setSelectedPasskey(passkey);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <DynamicT forKey="action.remove" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.divider} />
          <div className={styles.addSection}>
            <div className={styles.addTitle}>
              <DynamicT forKey="account_center.passkey.add_another_title" />
            </div>
            <div className={styles.addDescription}>
              <DynamicT forKey="account_center.passkey.add_another_description" />
            </div>
            <Button
              title="account_center.passkey.add_passkey"
              type="primary"
              onClick={() => {
                void navigate(passkeyAddRoute);
              }}
            />
          </div>
        </div>
      </SecondaryPageLayout>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="account_center.passkey.delete_confirmation_title"
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
      >
        <DynamicT
          forKey="account_center.passkey.delete_confirmation_description"
          interpolation={{ name: passkeyDisplayName }}
        />
      </ConfirmModal>
      <ConfirmModal
        isOpen={showEditModal}
        title="account_center.passkey.rename_passkey"
        confirmText="action.save"
        onConfirm={() => {
          void handleEditSubmit();
        }}
        onCancel={() => {
          setShowEditModal(false);
        }}
      >
        <div className={styles.editModalContent}>
          <DynamicT forKey="account_center.passkey.rename_description" />
          <InputField
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            name="passkeyName"
            value={editName}
            required={false}
            onChange={({ currentTarget }) => {
              setEditName(currentTarget.value);
            }}
          />
        </div>
      </ConfirmModal>
    </>
  );
};

export default PasskeyView;
