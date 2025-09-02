import { MfaFactor, type SignInExperience, type UserMfaVerificationResponse } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import MfaFactorName from '@/components/MfaFactorName';
import MfaFactorTitle from '@/components/MfaFactorTitle';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';
import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { type UserMfaVerification } from '@/types/mfa';

import { type UserDetailsOutletContext } from '../../types';

import styles from './index.module.scss';

type Props = {
  readonly userId: string;
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

  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');

  const api = useApi();
  const { show: showConfirm } = useConfirmModal();

  // Create Email and Phone MFA entries when conditions are met
  const emailPhoneMfaVerifications = useMemo(() => {
    if (!signInExperience?.mfa.factors) {
      return [];
    }

    // Add Email MFA if enabled and user has email
    const emailFactor =
      signInExperience.mfa.factors.includes(MfaFactor.EmailVerificationCode) && user.primaryEmail
        ? [
            {
              id: 'email-factor',
              type: MfaFactor.EmailVerificationCode,
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    // Add Phone MFA if enabled and user has phone
    const phoneFactor =
      signInExperience.mfa.factors.includes(MfaFactor.PhoneVerificationCode) && user.primaryPhone
        ? [
            {
              id: 'phone-factor',
              type: MfaFactor.PhoneVerificationCode,
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    return [...emailFactor, ...phoneFactor];
  }, [signInExperience?.mfa.factors, user]);

  // Helper function to determine sort order for MFA factors
  const getOrder = useCallback((type: MfaFactor, id: string) => {
    if (type === MfaFactor.BackupCode) {
      return 3; // Last
    }
    if (type === MfaFactor.EmailVerificationCode || type === MfaFactor.PhoneVerificationCode) {
      return id === 'email-factor' || id === 'phone-factor' ? 2 : 1; // Email/Phone factors after regular
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
      return getOrder(first.type, first.id) - getOrder(second.type, second.id);
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

  return (
    <>
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
              render: (mfaVerification) => <MfaFactorTitle {...mfaVerification} />,
            },
            {
              title: null,
              dataIndex: 'action',
              colSpan: 3,
              render: (mfaVerification) => {
                if (
                  mfaVerification.id === 'email-factor' ||
                  mfaVerification.id === 'phone-factor'
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
