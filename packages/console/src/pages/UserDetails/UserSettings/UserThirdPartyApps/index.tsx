import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import ApplicationName from '@/components/ApplicationName';
import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

import styles from './index.module.scss';
import useUserThirdPartyGrants, {
  type GrantedThirdPartyAppRow,
} from './use-user-third-party-grants';

type Props = {
  readonly userId: string;
};

function UserThirdPartyApps({ userId }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.user_details.third_party_apps',
  });
  const { show: showConfirm } = useConfirmModal();
  const { rowData, hasRows, isLoading, error, mutate, removingApplicationId, removeByApplication } =
    useUserThirdPartyGrants(userId);

  const onRemove = useCallback(
    async (app: GrantedThirdPartyAppRow) => {
      const [result] = await showConfirm({
        title: 'user_details.third_party_apps.revoke_access_title',
        ModalContent: t('revoke_access_description'),
        confirmButtonText: 'general.remove',
      });

      if (!result) {
        return;
      }

      await removeByApplication(app);
    },
    [removeByApplication, showConfirm, t]
  );

  return (
    <FormCard
      title="user_details.third_party_apps.title"
      description="user_details.third_party_apps.description"
    >
      <FormField title="user_details.third_party_apps.field_name">
        {!isLoading && !error && (
          <div className={styles.description}>
            {t(hasRows ? 'multiple_authorized' : 'not_authorized')}
          </div>
        )}
        {(isLoading || hasRows || error) && (
          <Table
            hasBorder
            isRowHoverEffectDisabled
            rowGroups={[{ key: 'thirdPartyApps', data: rowData }]}
            rowIndexKey="id"
            isLoading={isLoading}
            errorMessage={error?.body?.message ?? error?.message}
            columns={[
              {
                title: t('name_column'),
                dataIndex: 'applicationId',
                colSpan: 5,
                render: ({ applicationId }) => (
                  <ApplicationName isLink applicationId={applicationId} />
                ),
              },
              {
                title: t('app_id_column'),
                dataIndex: 'applicationId',
                colSpan: 5,
                render: ({ applicationId }) => applicationId,
              },
              {
                title: t('access_created_at_column'),
                dataIndex: 'createdAt',
                colSpan: 4,
                render: ({ createdAt }) => createdAt,
              },
              {
                title: null,
                dataIndex: 'action',
                colSpan: 2,
                render: (app) => (
                  <Button
                    title="general.remove"
                    type="text"
                    size="small"
                    isLoading={removingApplicationId === app.applicationId}
                    onClick={() => {
                      void onRemove(app);
                    }}
                  />
                ),
              },
            ]}
            onRetry={async () => mutate(undefined, true)}
          />
        )}
      </FormField>
    </FormCard>
  );
}

export default UserThirdPartyApps;
