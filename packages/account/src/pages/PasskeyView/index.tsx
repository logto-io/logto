/* eslint-disable max-lines -- The passkey list, delete, and rename flows share their step-up state on this page. */
import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import InputField from '@experience/shared/components/InputFields/InputField';
import {
  AccountCenterControlValue,
  MfaFactor,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { format } from 'date-fns';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getMfaVerifications, deleteMfaVerification, updateWebAuthnName } from '@ac/apis/mfa';
import ConfirmModal from '@ac/components/ConfirmModal';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { isDevFeaturesEnabled } from '@ac/constants/env';
import { passkeyAddRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '@ac/hooks/use-step-up';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { getDateFnsLocale } from '@ac/utils/date';
import { formatPasskeyName } from '@ac/utils/passkey';
import { isWebAuthnConfigurable } from '@ac/utils/security-page';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import styles from './index.module.scss';

type PasskeyInfo = {
  id: string;
  name?: string;
  agent?: string;
  createdAt: string;
  lastUsedAt?: string;
};

const formatDate = (dateString: string, language: string): string =>
  format(new Date(dateString), 'PPP', { locale: getDateFnsLocale(language) });

const PasskeyView = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, setVerificationId, setToast } =
    useContext(PageContext);
  const { verificationId, checkIdentityProof } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
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

  const fetchPasskeys = useCallback(async () => {
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
  }, [getMfaRequest]);

  // Fetch passkeys on mount
  useEffect(() => {
    // DEV: OIDC step-up authentication in Account Center
    if (!verificationId && !isDevFeaturesEnabled) {
      return;
    }

    void fetchPasskeys();
  }, [fetchPasskeys, verificationId]);

  const deletePasskey = useCallback(
    async (id: string, isResumed = false) => {
      const [error] = await deletePasskeyRequest(verificationId, id);

      if (error) {
        if (await requestStepUp(error, { type: 'delete-passkey', id }, { isResumed })) {
          return;
        }

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

      if (isResumed) {
        // The confirmed removal runs once after the step-up, then the list reloads with the
        // elevated token.
        await fetchPasskeys();
      } else {
        setPasskeys((previous) => previous?.filter((passkey) => passkey.id !== id));
      }

      setToast(t('account_center.passkey.deleted'));
    },
    [
      deletePasskeyRequest,
      fetchPasskeys,
      handleError,
      requestStepUp,
      setToast,
      setVerificationId,
      t,
      verificationId,
    ]
  );

  const renamePasskey = useCallback(
    async (id: string, name: string, isResumed = false) => {
      const [error] = await updatePasskeyNameRequest(verificationId, id, name);

      if (error) {
        if (await requestStepUp(error, { type: 'rename-passkey', id, name }, { isResumed })) {
          return;
        }

        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        setShowEditModal(false);
        return;
      }

      setShowEditModal(false);

      if (isResumed) {
        // The confirmed rename runs once after the step-up, then the list reloads with the
        // elevated token.
        await fetchPasskeys();
      } else {
        setPasskeys((previous) =>
          previous?.map((passkey) => (passkey.id === id ? { ...passkey, name } : passkey))
        );
      }

      setToast(t('account_center.passkey.renamed'));
    },
    [
      fetchPasskeys,
      handleError,
      requestStepUp,
      setToast,
      setVerificationId,
      t,
      updatePasskeyNameRequest,
      verificationId,
    ]
  );

  useEffect(() => {
    const action = consumePendingStepUpAction(['delete-passkey', 'rename-passkey']);

    if (!action) {
      return;
    }

    if (action.type === 'delete-passkey') {
      void deletePasskey(action.id, true);
      return;
    }

    void renamePasskey(action.id, action.name, true);
  }, [deletePasskey, renamePasskey]);

  const handleDelete = useCallback(async () => {
    if (!selectedPasskey) {
      return;
    }

    const { id } = selectedPasskey;

    if (!(await checkIdentityProof()) && (await startStepUp({ type: 'delete-passkey', id }))) {
      return;
    }

    await deletePasskey(id);
  }, [checkIdentityProof, deletePasskey, selectedPasskey, startStepUp]);

  const handleEditSubmit = useCallback(async () => {
    if (!selectedPasskey || !editName.trim()) {
      return;
    }

    const { id } = selectedPasskey;
    const name = editName.trim();

    if (
      !(await checkIdentityProof()) &&
      (await startStepUp({ type: 'rename-passkey', id, name }))
    ) {
      return;
    }

    await renamePasskey(id, name);
  }, [checkIdentityProof, editName, renamePasskey, selectedPasskey, startStepUp]);

  if (
    !accountCenterSettings?.enabled ||
    (accountCenterSettings.fields.passkey ?? accountCenterSettings.fields.mfa) !==
      AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isWebAuthnConfigurable(experienceSettings)) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.passkey_not_enabled"
      />
    );
  }

  // DEV: OIDC step-up authentication in Account Center
  if (!verificationId && !isDevFeaturesEnabled) {
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
                        interpolation={{ date: formatDate(passkey.createdAt, i18n.language) }}
                      />
                    </div>
                    <div className={styles.passkeyMeta}>
                      <DynamicT
                        forKey="account_center.passkey.last_used"
                        interpolation={{
                          date: passkey.lastUsedAt
                            ? formatDate(passkey.lastUsedAt, i18n.language)
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
          {passkeys.length > 0 && <div className={styles.divider} />}
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
                navigate(passkeyAddRoute);
              }}
            />
          </div>
        </div>
      </SecondaryPageLayout>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="account_center.passkey.delete_confirmation_title"
        confirmText="action.remove"
        confirmButtonType="danger"
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
      >
        <DynamicT forKey="account_center.passkey.delete_confirmation_description" />
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
/* eslint-enable max-lines */
