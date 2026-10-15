import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg?react';
import EnterpriseSsoConnectorEmptyDark from '@/assets/images/sso-connector-empty-dark.svg?react';
import EnterpriseSsoConnectorEmpty from '@/assets/images/sso-connector-empty.svg?react';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import AppBoundary from '@/containers/AppBoundary';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import useCurrentUser from '@/hooks/use-current-user';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import connectorStyles from '@/pages/EnterpriseSso/index.module.scss';
import pageLayout from '@/scss/page-layout.module.scss';

import CreationModal from './CreationModal';
import { getConsoleSsoDetailsPath } from './Details/paths';
import DomainTags from './DomainTags';
import styles from './index.module.scss';
import { useConsoleSsoConnectors } from './use-console-sso';

function ConsoleSso() {
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { user, error: userError, reload } = useCurrentUser();
  const { data, error, isLoading, mutate } = useConsoleSsoConnectors();
  const [creationUserId, setCreationUserId] = useState<string>();
  const addButton = (
    <Button
      title="cloud.console_sso.create"
      type="primary"
      size="large"
      icon={<Plus />}
      disabled={!user || Boolean(userError)}
      onClick={() => {
        setCreationUserId(user?.id);
      }}
    />
  );

  return (
    <AppBoundary>
      <div className={styles.pageContainer}>
        <PageMeta titleKey="cloud.console_sso.title" />
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={styles.scrollable}>
          <div className={styles.wrapper}>
            <div className={pageLayout.headline}>
              <CardTitle title="cloud.console_sso.title" subtitle="cloud.console_sso.description" />
              {user && !userError && Boolean(data?.length) && addButton}
            </div>
            <Table
              className={pageLayout.table}
              rowGroups={[{ key: 'console-sso', data: user && !error ? data : undefined }]}
              rowIndexKey="id"
              isLoading={(!user && !userError) || isLoading}
              errorMessage={userError?.message ?? error?.message}
              columns={[
                {
                  title: t('enterprise_sso.col_connector_name'),
                  dataIndex: 'connector',
                  colSpan: 5,
                  render: (connector) => (
                    <ItemPreview
                      title={
                        <span className={styles.connectorName}>
                          {connector.branding.displayName ?? connector.name}
                        </span>
                      }
                      icon={
                        <SsoConnectorLogo
                          data={connector}
                          className={connectorStyles.logo}
                          containerClassName={connectorStyles.container}
                        />
                      }
                    />
                  ),
                },
                {
                  title: t('enterprise_sso.col_type'),
                  dataIndex: 'type',
                  colSpan: 4,
                  render: ({ name }) => <div className={connectorStyles.type}>{name}</div>,
                },
                {
                  title: t('enterprise_sso.col_email_domain'),
                  dataIndex: 'domains',
                  colSpan: 7,
                  render: (connector) => <DomainTags data={connector} />,
                },
              ]}
              rowClickHandler={({ id }) => {
                navigate(getConsoleSsoDetailsPath(id));
              }}
              placeholder={
                <TablePlaceholder
                  image={<EnterpriseSsoConnectorEmpty />}
                  imageDark={<EnterpriseSsoConnectorEmptyDark />}
                  title="cloud.console_sso.title"
                  description="cloud.console_sso.description"
                  action={addButton}
                />
              }
              onRetry={() => {
                void reload();
                void mutate();
              }}
            />
          </div>
        </OverlayScrollbar>
        {user && !userError && creationUserId === user.id && (
          <CreationModal
            key={user.id}
            userId={user.id}
            onClose={(id) => {
              setCreationUserId(undefined);
              if (id) {
                navigate(getConsoleSsoDetailsPath(id));
              }
            }}
          />
        )}
      </div>
    </AppBoundary>
  );
}

export default ConsoleSso;
