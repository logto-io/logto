/* eslint-disable max-lines -- Create, show-once, rename, and revoke flows are co-located in this section. */
import SelectField from '@experience/components/InputFields/SelectField';
import DynamicT from '@experience/shared/components/DynamicT';
import InputField from '@experience/shared/components/InputFields/InputField';
import type { AccountPersonalAccessTokenResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createPersonalAccessToken,
  getPersonalAccessTokens,
  renamePersonalAccessToken,
  revokePersonalAccessToken,
} from '@ac/apis/personal-access-tokens';
import ConfirmModal from '@ac/components/ConfirmModal';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '@ac/hooks/use-step-up';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

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
  const { accountCenterSettings, setToast } = useContext(PageContext);
  const { checkIdentityProof } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
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
    async (name: string, expiryDays: number, isResumed = false) => {
      setIsCreating(true);
      const expiresAt = Date.now() + expiryDays * dayInMs - clockSkewMarginMs;
      const [error, result] = await createTokenApi({ name, expiresAt });

      if (error) {
        if (
          await requestStepUp(
            error,
            { type: 'create-personal-access-token', name, expiryDays },
            { isResumed }
          )
        ) {
          // Keep the confirmation loading until the full-page step-up starts.
          return;
        }

        setIsCreating(false);
        await handleError(error);
        return;
      }

      setIsCreating(false);
      setIsCreateModalOpen(false);
      setNewTokenName('');
      setNewTokenExpiryDays(defaultExpiryDays);
      setCreatedToken(result?.value);
      await fetchTokens();
    },
    [createTokenApi, fetchTokens, handleError, requestStepUp]
  );

  const renameToken = useCallback(
    async (currentName: string, name: string, isResumed = false) => {
      setIsRenaming(true);
      const [error] = await renameTokenApi({ currentName, name });

      if (error) {
        if (
          await requestStepUp(
            error,
            { type: 'rename-personal-access-token', currentName, name },
            { isResumed }
          )
        ) {
          // Keep the confirmation loading until the full-page step-up starts.
          return;
        }

        setIsRenaming(false);
        await handleError(error);
        return;
      }

      setIsRenaming(false);
      setRenameTarget(undefined);
      setRenameValue('');
      setToast(t('account_center.security.personal_access_tokens.renamed'));
      await fetchTokens();
    },
    [fetchTokens, handleError, renameTokenApi, requestStepUp, setToast, t]
  );

  const revokeToken = useCallback(
    async (name: string, isResumed = false) => {
      setIsRevoking(true);
      const [error] = await revokeTokenApi(name);

      if (error) {
        if (
          await requestStepUp(error, { type: 'revoke-personal-access-token', name }, { isResumed })
        ) {
          // Keep the confirmation loading until the full-page step-up starts.
          return;
        }

        setIsRevoking(false);
        await handleError(error);
        return;
      }

      setIsRevoking(false);
      setTokens((previous) => previous?.filter((token) => token.name !== name));
      setRevokeTarget(undefined);
      setToast(t('account_center.security.personal_access_tokens.revoked'));
    },
    [handleError, requestStepUp, revokeTokenApi, setToast, t]
  );

  useEffect(() => {
    const action = consumePendingStepUpAction([
      'create-personal-access-token',
      'rename-personal-access-token',
      'revoke-personal-access-token',
    ]);

    switch (action?.type) {
      case 'create-personal-access-token': {
        void createToken(action.name, action.expiryDays, true);
        break;
      }
      case 'rename-personal-access-token': {
        void renameToken(action.currentName, action.name, true);
        break;
      }
      case 'revoke-personal-access-token': {
        void revokeToken(action.name, true);
        break;
      }
      default:
    }
  }, [createToken, renameToken, revokeToken]);

  const handleCreateSubmit = useCallback(async () => {
    const trimmedName = newTokenName.trim();
    if (!trimmedName) {
      return;
    }

    if (await checkIdentityProof()) {
      await createToken(trimmedName, newTokenExpiryDays);
      return;
    }

    const action = {
      type: 'create-personal-access-token' as const,
      name: trimmedName,
      expiryDays: newTokenExpiryDays,
    };

    await startStepUp(action);
  }, [checkIdentityProof, createToken, newTokenExpiryDays, newTokenName, startStepUp]);

  const handleRenameSubmit = useCallback(async () => {
    const trimmedName = renameValue.trim();
    if (!renameTarget || !trimmedName) {
      return;
    }

    if (await checkIdentityProof()) {
      await renameToken(renameTarget.name, trimmedName);
      return;
    }

    const action = {
      type: 'rename-personal-access-token' as const,
      currentName: renameTarget.name,
      name: trimmedName,
    };

    await startStepUp(action);
  }, [checkIdentityProof, renameTarget, renameToken, renameValue, startStepUp]);

  const handleConfirmRevoke = useCallback(async () => {
    if (!revokeTarget) {
      return;
    }

    const targetName = revokeTarget.name;

    if (await checkIdentityProof()) {
      await revokeToken(targetName);
      return;
    }

    await startStepUp({ type: 'revoke-personal-access-token', name: targetName });
  }, [checkIdentityProof, revokeTarget, revokeToken, startStepUp]);

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
