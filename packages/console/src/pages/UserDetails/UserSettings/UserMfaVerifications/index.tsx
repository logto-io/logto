import {
  isVerificationCodeMfaFactor,
  MfaFactor,
  resolveUserMfaFactors,
  type SignInExperience,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import MfaFactorName from '@/components/MfaFactorName';
import MfaFactorTitle from '@/components/MfaFactorTitle';
import Button from '@/ds-components/Button';
import Switch from '@/ds-components/Switch';
import Table from '@/ds-components/Table';
import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import { type UserMfaVerification } from '@/types/mfa';

import { type UserDetailsOutletContext } from '../../types';

import styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

type UserLogtoConfigResponse = {
  mfa: {
    required: boolean;
  };
};

function UserMfaVerifications({ userId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.user_details.mfa' });
  const { user } = useOutletContext<UserDetailsOutletContext>();
  const {
    data: mfaVerifications,
    error,
    isLoading,
    mutate,
  } = useSWR<UserMfaVerificationResponse, RequestError>(`api/users/${userId}/mfa-verifications`);

  const { data: logtoConfig, mutate: mutateLogtoConfig } = useSWR<
    UserLogtoConfigResponse,
    RequestError
  >(`api/users/${userId}/logto-configs`);

  const { data: signInExperience } = useSWRImmutable<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const api = useApi();
  const { show: showConfirm } = useConfirmModal();
  const {
    access: { isReadOnly },
  } = useCurrentTenantScopes();
  const [isUpdatingMfaRequirement, setIsUpdatingMfaRequirement] = useState(false);

  const countedFactors = useMemo(
    () =>
      signInExperience &&
      mfaVerifications &&
      resolveUserMfaFactors({
        mfaSettings: signInExperience.mfa,
        storedFactors: mfaVerifications.map(({ type }) => type),
        hasPrimaryEmail: Boolean(user.primaryEmail),
        hasPrimaryPhone: Boolean(user.primaryPhone),
      }),
    [mfaVerifications, signInExperience, user]
  );

  // Email and phone MFA the user has without a stored record, which only implicit enrollment gives
  const emailPhoneMfaVerifications = useMemo(() => {
    if (!countedFactors || !mfaVerifications) {
      return [];
    }

    return countedFactors
      .filter(
        (type) =>
          isVerificationCodeMfaFactor(type) &&
          mfaVerifications.every((verification) => verification.type !== type)
      )
      .map((type) => ({
        id: type === MfaFactor.EmailVerificationCode ? 'email-factor' : 'phone-factor',
        type,
        createdAt: new Date().toISOString(),
      }));
  }, [countedFactors, mfaVerifications]);

  const getFactorTip = useCallback(
    ({ id, type }: UserMfaVerification) => {
      if (id === 'email-factor' || id === 'phone-factor') {
        return t('implicit_factor_tip');
      }

      if (isVerificationCodeMfaFactor(type) && countedFactors && !countedFactors.includes(type)) {
        return t('not_counted_factor_tip');
      }
    },
    [countedFactors, t]
  );

  // Helper function to determine sort order for MFA factors
  const getOrder = useCallback((type: MfaFactor) => {
    if (type === MfaFactor.BackupCode) {
      return 3; // Last
    }
    if (isVerificationCodeMfaFactor(type)) {
      return 2; // Email/Phone factors after regular
    }
    return 1; // Regular factors first
  }, []);

  const allMfaVerifications = useMemo(() => {
    if (!mfaVerifications) {
      return [];
    }

    const combined = [...mfaVerifications, ...emailPhoneMfaVerifications];

    // Sort: regular factors first, then Email/Phone factors, then backup code last
    return combined.slice().sort((first, second) => {
      return getOrder(first.type) - getOrder(second.type);
    });
  }, [mfaVerifications, emailPhoneMfaVerifications, getOrder]);

  const handleDelete = useCallback(
    async (mfaVerification: UserMfaVerification) => {
      const [result] = await showConfirm({
        ModalContent: () => (
          <Trans
            t={t}
            i18nKey="deletion_confirmation"
            components={{
              name: <MfaFactorName {...mfaVerification} />,
            }}
          />
        ),
        confirmButtonText: 'general.remove',
      });

      if (!result) {
        return;
      }

      await api.delete(`api/users/${userId}/mfa-verifications/${mfaVerification.id}`);
      void mutate(mfaVerifications?.filter((item) => item.id !== mfaVerification.id));
    },
    [api, mfaVerifications, mutate, showConfirm, t, userId]
  );

  const handleMfaRequirementChange = useCallback(
    async (required: boolean) => {
      setIsUpdatingMfaRequirement(true);

      try {
        await api.patch(`api/users/${userId}/logto-configs`, { json: { mfa: { required } } });
        await mutateLogtoConfig();
      } finally {
        setIsUpdatingMfaRequirement(false);
      }
    },
    [api, mutateLogtoConfig, userId]
  );

  return (
    <>
      <div className={styles.mfaRequirement}>
        <Switch
          checked={logtoConfig?.mfa.required ?? false}
          disabled={isReadOnly || !logtoConfig || isUpdatingMfaRequirement}
          label={
            <>
              <div className={styles.mfaRequirementTitle}>{t('require_mfa')}</div>
              <div className={styles.mfaRequirementDescription}>{t('require_mfa_description')}</div>
            </>
          }
          onChange={({ currentTarget: { checked } }) => {
            void handleMfaRequirementChange(checked);
          }}
        />
      </div>
      {!isLoading && !error && (
        <div className={styles.fieldDescription}>
          {t(allMfaVerifications.length > 0 ? 'field_description' : 'field_description_empty')}
        </div>
      )}
      {(isLoading || allMfaVerifications.length > 0 || error) && (
        <Table
          isRowHoverEffectDisabled
          hasBorder
          rowGroups={[{ key: 'mfaVerifications', data: allMfaVerifications }]}
          rowIndexKey="id"
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          columns={[
            {
              title: t('name_column'),
              dataIndex: 'name',
              colSpan: 13,
              render: (mfaVerification) => (
                <MfaFactorTitle
                  {...mfaVerification}
                  // Explain email and phone rows that differ from what sign-in counts
                  tooltip={getFactorTip(mfaVerification)}
                />
              ),
            },
            {
              title: null,
              dataIndex: 'action',
              colSpan: 3,
              render: (mfaVerification) => {
                if (
                  isReadOnly ||
                  mfaVerification.id === 'email-factor' ||
                  mfaVerification.id === 'phone-factor' ||
                  (mfaVerification.type === MfaFactor.WebAuthn &&
                    signInExperience?.passkeySignIn.enabled)
                ) {
                  return null;
                }

                return (
                  <Button
                    title="general.remove"
                    type="text"
                    size="small"
                    onClick={() => {
                      void handleDelete(mfaVerification);
                    }}
                  />
                );
              },
            },
          ]}
          onRetry={() => {
            void mutate();
          }}
        />
      )}
    </>
  );
}

export default UserMfaVerifications;
