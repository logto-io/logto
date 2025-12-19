import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Breakable from '@/components/Breakable';
import FormCard from '@/components/FormCard';
import Table from '@/ds-components/Table';
import { type RowGroup } from '@/ds-components/Table/types';
import Tag from '@/ds-components/Tag';

import styles from './index.module.scss';

type OidcPermissionRow = {
  id: string;
  name: string;
  description: string;
};

function OidcPermissionsCard() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const rowGroups: Array<RowGroup<OidcPermissionRow>> = useMemo(
    () => [
      {
        key: 'oidc_permissions',
        data: [
          {
            id: 'openid',
            name: t('application_details.permissions.openid_permission'),
            description: t('application_details.permissions.openid_permission_guide'),
          },
          {
            id: 'offline_access',
            name: t('application_details.permissions.offline_access_permission'),
            description: t('application_details.permissions.offline_access_permission_guide'),
          },
        ],
      },
    ],
    [t]
  );

  return (
    <FormCard
      title="application_details.permissions.oidc_title"
      description="application_details.permissions.oidc_description"
    >
      <section className={styles.section}>
        <header className={styles.title}>
          {t('application_details.permissions.default_oidc_permissions')}
        </header>
        <Table
          hasBorder
          isRowHoverEffectDisabled
          rowIndexKey="id"
          rowGroups={rowGroups}
          columns={[
            {
              title: t('application_details.permissions.permission_column'),
              dataIndex: 'name',
              colSpan: 5,
              render: ({ name }) => (
                <Tag variant="cell">
                  <Breakable>{name}</Breakable>
                </Tag>
              ),
            },
            {
              title: t('application_details.permissions.guide_column'),
              dataIndex: 'description',
              colSpan: 6,
              render: ({ description }) => (
                <Breakable>
                  <span className={styles.guideText}>{description}</span>
                </Breakable>
              ),
            },
          ]}
        />
      </section>
    </FormCard>
  );
}

export default OidcPermissionsCard;
