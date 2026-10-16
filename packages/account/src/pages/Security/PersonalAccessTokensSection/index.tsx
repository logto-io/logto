/* eslint-disable max-lines -- Create, show-once, rename, and revoke flows are co-located in this section. */
import SelectField from '@experience/components/InputFields/SelectField';
import DynamicT from '@experience/shared/components/DynamicT';
import InputField from '@experience/shared/components/InputFields/InputField';
import type { AccountPersonalAccessTokenResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createPersonalAccessToken,
  getPersonalAccessTokens,
  renamePersonalAccessToken,
  revokePersonalAccessToken,
} from '@ac/apis/personal-access-tokens';
import ConfirmModal from '@ac/components/ConfirmModal';
import { verifiedActionRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { sessionStorage } from '@ac/utils/session-storage';

import SecuritySection from '../components/SecuritySection';

import PersonalAccessTokenRow from './PersonalAccessTokenRow';
import styles from './index.module.scss';

const expiryDayOptions = Object.freeze([30, 90, 180, 365]);
const defaultExpiryDays = 90;
const dayInMs = 24 * 60 * 60 * 1000;
/**
 * Subtracted from the computed expiration time so that a client clock running slightly ahead of
 * the server does not push the max option past the server's 365-day limit.
 */
const clockSkewMarginMs = 60 * 1000;

const PersonalAccessTokensSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const [tokens, setTokens] = useState<AccountPersonalAccessTokenResponse[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [isScopeUnavailable, setIsScopeUnavailable] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiryDays, setNewTokenExpiryDays] = useState<number>(defaultExpiryDays);
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<string>();

  const [renameTarget, setRenameTarget] = useState<AccountPersonalAccessTokenResponse>();
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState<AccountPersonalAccessTokenResponse>();
  const [isRevoking, setIsRevoking] = useState(false);

  const getTokensApi = useApi(getPersonalAccessTokens, { silent: true });
  const createTokenApi = useApi(createPersonalAccessToken, { silent: true });
  const renameTokenApi = useApi(renamePersonalAccessToken, { silent: true });
  const revokeTokenApi = useApi(revokePersonalAccessToken, { silent: true });
  const handleError = useErrorHandler();

  const control = accountCenterSettings?.fields.personalAccessToken;
  const isVisible =
    control === AccountCenterControlValue.ReadOnly || control === AccountCenterControlValue.Edit;
  const isEditable = control === AccountCenterControlValue.Edit;

  const expirySelectOptions = useMemo(
    () =>
      expiryDayOptions.map((count) => ({
        value: String(count),
        label: t('account_center.security.personal_access_tokens.expiration_days', { count }),
      })),
    [t]
  );

  const handlePermissionDenied = useCallback(() => {
    setVerificationId(undefined);
    setToast(t('account_center.verification.verification_required'));
  }, [setToast, setVerificationId, t]);

  const fetchTokens = useCallback(async () => {
    if (!isVisible) {
      return;
    }

    setIsLoading(true);
    setHasLoadingError(false);
    const [error, result] = await getTokensApi();

    if (error) {
      setHasLoadingError(true);
      await handleError(error, {
        'auth.unauthorized': () => {
          setHasLoadingError(false);
          setIsScopeUnavailable(true);
        },
      });
    } else {
      setTokens(result ?? []);
    }

    setIsLoading(false);
  }, [getTokensApi, handleError, isVisible]);

  useEffect(() => {
    void fetchTokens();
  }, [fetchTokens]);

  const createToken = useCallback(
    async (verifiedId: string, name: string, expiryDays: number) => {
      setIsCreating(true);
      const expiresAt = Date.now() + expiryDays * dayInMs - clockSkewMarginMs;
      const [error, result] = await createTokenApi(verifiedId, { name, expiresAt });
      setIsCreating(false);

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
        return;
      }

      setIsCreateModalOpen(false);
      setNewTokenName('');
      setNewTokenExpiryDays(defaultExpiryDays);
      setCreatedToken(result?.value);
      await fetchTokens();
    },
    [createTokenApi, fetchTokens, handleError, handlePermissionDenied]
  );

  const renameToken = useCallback(
    async (verifiedId: string, currentName: string, name: string) => {
      setIsRenaming(true);
      const [error] = await renameTokenApi(verifiedId, { currentName, name });
      setIsRenaming(false);

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
        return;
      }

      setRenameTarget(undefined);
      setRenameValue('');
      setToast(t('account_center.security.personal_access_tokens.renamed'));
      await fetchTokens();
    },
    [fetchTokens, handleError, handlePermissionDenied, renameTokenApi, setToast, t]
  );

  const revokeToken = useCallback(
    async (verifiedId: string, name: string) => {
      setIsRevoking(true);
      const [error] = await revokeTokenApi(verifiedId, name);
      setIsRevoking(false);

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
        return;
      }

      setTokens((previous) => previous?.filter((token) => token.name !== name));
      setRevokeTarget(undefined);
      setToast(t('account_center.security.personal_access_tokens.revoked'));
    },
    [handleError, handlePermissionDenied, revokeTokenApi, setToast, t]
  );

  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const pendingAction = sessionStorage.getPendingVerifiedAction();

    if (pendingAction === 'create-personal-access-token') {
      const pendingCreate = sessionStorage.getPendingPersonalAccessTokenCreate();
      sessionStorage.clearPendingVerifiedAction();
      sessionStorage.clearPendingPersonalAccessTokenCreate();

      if (pendingCreate) {
        void createToken(verificationId, pendingCreate.name, pendingCreate.expiryDays);
      } else {
        setIsCreateModalOpen(true);
      }
      return;
    }

    if (pendingAction === 'rename-personal-access-token') {
      const pendingRename = sessionStorage.getPendingPersonalAccessTokenRename();
      sessionStorage.clearPendingVerifiedAction();
      sessionStorage.clearPendingPersonalAccessTokenRename();

      if (pendingRename) {
        void renameToken(verificationId, pendingRename.currentName, pendingRename.name);
      }
      return;
    }

    if (pendingAction === 'revoke-personal-access-token') {
      const pendingRevokeName = sessionStorage.getPendingPersonalAccessTokenRevokeName();
      sessionStorage.clearPendingVerifiedAction();
      sessionStorage.clearPendingPersonalAccessTokenRevokeName();

      if (pendingRevokeName) {
        void revokeToken(verificationId, pendingRevokeName);
      }
    }
  }, [createToken, renameToken, revokeToken, verificationId]);

  const handleCreateSubmit = useCallback(async () => {
    const trimmedName = newTokenName.trim();
    if (!trimmedName) {
      return;
    }

    if (verificationId) {
      await createToken(verificationId, trimmedName, newTokenExpiryDays);
      return;
    }

    setIsCreateModalOpen(false);
    sessionStorage.setPendingPersonalAccessTokenCreate({
      name: trimmedName,
      expiryDays: newTokenExpiryDays,
    });
    sessionStorage.setPendingVerifiedAction('create-personal-access-token');
    setPendingReturn(getPendingReturn() ?? window.location.href);
    navigate(verifiedActionRoute);
  }, [createToken, navigate, newTokenExpiryDays, newTokenName, verificationId]);

  const handleRenameSubmit = useCallback(async () => {
    const trimmedName = renameValue.trim();
    if (!renameTarget || !trimmedName) {
      return;
    }

    if (verificationId) {
      await renameToken(verificationId, renameTarget.name, trimmedName);
      return;
    }

    setRenameTarget(undefined);
    sessionStorage.setPendingPersonalAccessTokenRename({
      currentName: renameTarget.name,
      name: trimmedName,
    });
    sessionStorage.setPendingVerifiedAction('rename-personal-access-token');
    setPendingReturn(getPendingReturn() ?? window.location.href);
    navigate(verifiedActionRoute);
  }, [navigate, renameTarget, renameToken, renameValue, verificationId]);

  const handleConfirmRevoke = useCallback(async () => {
    if (!revokeTarget) {
      return;
    }

    if (verificationId) {
      await revokeToken(verificationId, revokeTarget.name);
      return;
    }

    const targetName = revokeTarget.name;
    setRevokeTarget(undefined);
    sessionStorage.setPendingPersonalAccessTokenRevokeName(targetName);
    sessionStorage.setPendingVerifiedAction('revoke-personal-access-token');
    setPendingReturn(getPendingReturn() ?? window.location.href);
    navigate(verifiedActionRoute);
  }, [navigate, revokeTarget, revokeToken, verificationId]);

  if (!isVisible || isScopeUnavailable) {
    return null;
  }

  return (
    <>
      <SecuritySection
        title={t('account_center.security.personal_access_tokens.title')}
        description={t('account_center.security.personal_access_tokens.description')}
      >
        {isLoading ? (
          <div className={styles.state}>
            {t('account_center.security.personal_access_tokens.loading')}
          </div>
        ) : hasLoadingError ? (
          <div className={styles.state}>
            <span>{t('account_center.security.personal_access_tokens.load_failed')}</span>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                void fetchTokens();
              }}
            >
              {t('account_center.security.personal_access_tokens.retry')}
            </button>
          </div>
        ) : tokens && tokens.length > 0 ? (
          tokens.map((token) => (
            <PersonalAccessTokenRow
              key={token.name}
              token={token}
              isEditable={isEditable}
              onRename={() => {
                setRenameTarget(token);
                setRenameValue(token.name);
              }}
              onRevoke={() => {
                setRevokeTarget(token);
              }}
            />
          ))
        ) : (
          <div className={styles.state}>
            {t('account_center.security.personal_access_tokens.empty')}
          </div>
        )}
        {isEditable && !isLoading && !hasLoadingError && (
          <div className={styles.footerRow}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                setNewTokenName('');
                setNewTokenExpiryDays(defaultExpiryDays);
                setIsCreateModalOpen(true);
              }}
            >
              {t('account_center.security.personal_access_tokens.create')}
            </button>
          </div>
        )}
      </SecuritySection>

      <ConfirmModal
        isOpen={isCreateModalOpen}
        title="account_center.security.personal_access_tokens.create_modal_title"
        confirmText="action.create"
        cancelText="action.cancel"
        isLoading={isCreating}
        onConfirm={() => {
          void handleCreateSubmit();
        }}
        onCancel={() => {
          if (!isCreating) {
            setIsCreateModalOpen(false);
          }
        }}
      >
        <div className={styles.modalContent}>
          <DynamicT forKey="account_center.security.personal_access_tokens.create_modal_description" />
          <InputField
            // eslint-disable-next-line jsx-a11y/no-autofocus -- Focus name input when opening the create dialog.
            autoFocus
            name="tokenName"
            label={t('account_center.security.personal_access_tokens.token_name')}
            placeholder={t('account_center.security.personal_access_tokens.token_name_placeholder')}
            value={newTokenName}
            onChange={({ currentTarget }) => {
              setNewTokenName(currentTarget.value);
            }}
          />
          <SelectField
            name="tokenExpiration"
            label={t('account_center.security.personal_access_tokens.expiration')}
            value={String(newTokenExpiryDays)}
            options={expirySelectOptions}
            onChange={(value) => {
              setNewTokenExpiryDays(Number(value));
            }}
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={Boolean(createdToken)}
        title="account_center.security.personal_access_tokens.created_modal_title"
        confirmText="action.copy"
        cancelText="action.done"
        isDismissible={false}
        onConfirm={() => {
          if (createdToken) {
            void navigator.clipboard.writeText(createdToken);
            setToast(t('account_center.security.personal_access_tokens.copied'));
          }
        }}
        onCancel={() => {
          setCreatedToken(undefined);
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.warningBanner}>
            {t('account_center.security.personal_access_tokens.show_once_warning')}
          </div>
          <div className={styles.tokenValueBox}>{createdToken}</div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={Boolean(renameTarget)}
        title="account_center.security.personal_access_tokens.rename_modal_title"
        confirmText="action.save"
        cancelText="action.cancel"
        isLoading={isRenaming}
        onConfirm={() => {
          void handleRenameSubmit();
        }}
        onCancel={() => {
          if (!isRenaming) {
            setRenameTarget(undefined);
          }
        }}
      >
        <div className={styles.modalContent}>
          <DynamicT forKey="account_center.security.personal_access_tokens.rename_modal_description" />
          <InputField
            // eslint-disable-next-line jsx-a11y/no-autofocus -- Focus name input when opening the rename dialog.
            autoFocus
            name="renameTokenName"
            label={t('account_center.security.personal_access_tokens.token_name')}
            value={renameValue}
            onChange={({ currentTarget }) => {
              setRenameValue(currentTarget.value);
            }}
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={Boolean(revokeTarget)}
        title="account_center.security.personal_access_tokens.revoke_confirmation_title"
        confirmText="account_center.security.personal_access_tokens.revoke"
        confirmButtonType="danger"
        cancelText="action.cancel"
        isLoading={isRevoking}
        onConfirm={() => {
          void handleConfirmRevoke();
        }}
        onCancel={() => {
          if (!isRevoking) {
            setRevokeTarget(undefined);
          }
        }}
      >
        {t('account_center.security.personal_access_tokens.revoke_confirmation_description', {
          name: revokeTarget?.name ?? '',
        })}
      </ConfirmModal>
    </>
  );
};

export default PersonalAccessTokensSection;
/* eslint-enable max-lines */
