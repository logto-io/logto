import { type UserMfaVerificationResponse } from '@logto/schemas';
import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import MfaFactorName from '@/components/MfaFactorName';
import MfaFactorTitle from '@/components/MfaFactorTitle';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';
import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { type UserMfaVerification } from '@/types/mfa';

import * as styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

function UserMfaVerifications({ userId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.user_details.mfa' });
  const {
    data: mfaVerifications,
    error,
    isLoading,
    mutate,
  } = useSWR<UserMfaVerificationResponse, RequestError>(`api/users/${userId}/mfa-verifications`);

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

  return (
    <>
      {!isLoading && !error && (
        <div className={styles.fieldDescription}>
          {t(mfaVerifications?.length ? 'field_description' : 'field_description_empty')}
        </div>
      )}
      {(isLoading || Boolean(mfaVerifications?.length) || error) && (
        <Table
          hasBorder
          rowGroups={[{ key: 'mfaVerifications', data: mfaVerifications }]}
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

export default UserMfaVerifications;
