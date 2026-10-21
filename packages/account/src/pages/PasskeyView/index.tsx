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
import StepUpEntryFallback from '@ac/components/StepUpEntryFallback';
import { passkeyAddRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useStepUpEntry } from '@ac/hooks/use-step-up';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { getDateFnsLocale } from '@ac/utils/date';
import { formatPasskeyName } from '@ac/utils/passkey';
import { isWebAuthnConfigurable } from '@ac/utils/security-page';

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
  const { accountCenterSettings, experienceSettings, setToast } = useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications);
  const deletePasskeyRequest = useApi(deleteMfaVerification);
  const updatePasskeyNameRequest = useApi(updateWebAuthnName);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();
  const isPageEnabled =
    Boolean(accountCenterSettings?.enabled) &&
    (accountCenterSettings?.fields.passkey ?? accountCenterSettings?.fields.mfa) ===
      AccountCenterControlValue.Edit &&
    isWebAuthnConfigurable(experienceSettings);
  const { isReady, hasFailed } = useStepUpEntry({ enabled: isPageEnabled });

  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>();
  const [hasError, setHasError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyInfo>();
  const [editName, setEditName] = useState('');

  // Fetch passkeys on mount
  useEffect(() => {
    if (!isReady) {
      return;
    }

    const fetchData = async () => {
      const [error, result] = await getMfaRequest();
      if (error || !result) {
        if (await requestStepUp(error, { type: 'enter-subpage' })) {
          return;
        }

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
  }, [getMfaRequest, isReady, requestStepUp]);

  const handleDelete = useCallback(async () => {
    if (!isReady || !selectedPasskey) {
      return;
    }

    const [error] = await deletePasskeyRequest(selectedPasskey.id);
    if (error) {
      if (await requestStepUp(error, { type: 'enter-subpage' })) {
        return;
      }

      await handleError(error);
      setShowDeleteConfirm(false);
      return;
    }

    setPasskeys((previous) => previous?.filter((passkey) => passkey.id !== selectedPasskey.id));
    setShowDeleteConfirm(false);
    setToast(t('account_center.passkey.deleted'));
  }, [deletePasskeyRequest, handleError, isReady, requestStepUp, selectedPasskey, setToast, t]);

  const handleEditSubmit = useCallback(async () => {
    if (!isReady || !selectedPasskey || !editName.trim()) {
      return;
    }

    const [error] = await updatePasskeyNameRequest(selectedPasskey.id, editName.trim());
    if (error) {
      if (await requestStepUp(error, { type: 'enter-subpage' })) {
        return;
      }

      await handleError(error);
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
    isReady,
    requestStepUp,
    selectedPasskey,
    setToast,
    t,
    updatePasskeyNameRequest,
  ]);

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

  if (!isReady) {
    return <StepUpEntryFallback hasFailed={hasFailed} />;
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
