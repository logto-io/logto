import { type UserMfaVerificationResponse, MfaFactor, type SignInExperience } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import MfaFactorName from '@/components/MfaFactorName';
import MfaFactorTitle from '@/components/MfaFactorTitle';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';
import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { type UserMfaVerification } from '@/types/mfa';

import styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

function UserSignInPasskeys({ userId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.user_details.passkey' });
  const {
    data: mfaVerifications,
    error,
    isLoading: isLoadingMfaVerifications,
    mutate,
  } = useSWR<UserMfaVerificationResponse, RequestError>(`api/users/${userId}/mfa-verifications`);

  const { data: signInExperience, isLoading: isLoadingSignInExp } = useSWRImmutable<
    SignInExperience,
    RequestError
  >('api/sign-in-exp');

  const isLoading = isLoadingMfaVerifications || isLoadingSignInExp;
  const isEmpty =
    !mfaVerifications || mfaVerifications.length === 0 || !signInExperience?.passkeySignIn.enabled;

  const api = useApi();
  const { show: showConfirm } = useConfirmModal();

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

  const data = useMemo(() => {
    if (!mfaVerifications) {
      return [];
    }

    return mfaVerifications.filter((verification) => verification.type === MfaFactor.WebAuthn);
  }, [mfaVerifications]);

  return (
    <>
      {!isLoading && !error && isEmpty && (
        <div className={styles.fieldDescription}>{t('field_description_empty')}</div>
      )}
      {(isLoading || !isEmpty || error) && (
        <Table
          isRowHoverEffectDisabled
          hasBorder
          rowGroups={[{ key: 'mfaVerifications', data }]}
          rowIndexKey="id"
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          columns={[
            {
              title: null,
              dataIndex: 'name',
              colSpan: 13,
              render: (mfaVerification) => <MfaFactorTitle {...mfaVerification} />,
            },
            {
              title: null,
              dataIndex: 'action',
              colSpan: 3,
              render: (mfaVerification) => (
                <Button
                  title="general.remove"
                  type="text"
                  size="small"
                  onClick={() => {
                    void handleDelete(mfaVerification);
                  }}
                />
              ),
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

export default UserSignInPasskeys;
