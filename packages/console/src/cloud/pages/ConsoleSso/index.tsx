import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg?react';
import EnterpriseSsoConnectorEmptyDark from '@/assets/images/sso-connector-empty-dark.svg?react';
import EnterpriseSsoConnectorEmpty from '@/assets/images/sso-connector-empty.svg?react';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import useCurrentUser from '@/hooks/use-current-user';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import connectorStyles from '@/pages/EnterpriseSso/index.module.scss';

import CreationModal from './CreationModal';
import DomainTags from './DomainTags';
import styles from './index.module.scss';
import { consoleSsoPath, useConsoleSsoConnectors } from './use-console-sso';

function ConsoleSso() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { user, error: userError, reload } = useCurrentUser();
  const { data, error, isLoading, mutate } = useConsoleSsoConnectors();
  const [isCreating, setIsCreating] = useState(false);
  const addButton = (
    <Button
      title="enterprise_sso.create"
      type="primary"
      icon={<Plus />}
      disabled={!user || Boolean(userError)}
      onClick={() => {
        setIsCreating(true);
      }}
    />
  );
  return (
    <>
      <Table
        rowGroups={[{ key: 'console-sso', data: user && !error ? data : undefined }]}
        rowIndexKey="id"
        isLoading={(!user && !userError) || isLoading}
        errorMessage={userError?.message ?? error?.message}
        filter={<div className={styles.actions}>{addButton}</div>}
        columns={[
          {
            title: t('enterprise_sso.col_connector_name'),
            dataIndex: 'connector',
            render: (connector) => (
              <div className={styles.connector}>
                <SsoConnectorLogo
                  data={connector}
                  className={connectorStyles.logo}
                  containerClassName={connectorStyles.container}
                />
                {connector.branding.displayName ?? connector.name}
              </div>
            ),
          },
          {
            title: t('enterprise_sso.col_email_domain'),
            dataIndex: 'domains',
            render: (connector) => <DomainTags data={connector} />,
          },
        ]}
        rowClickHandler={({ id }) => {
          navigate(`${consoleSsoPath}/${id}/connection`);
        }}
        placeholder={
          <TablePlaceholder
            image={<EnterpriseSsoConnectorEmpty />}
            imageDark={<EnterpriseSsoConnectorEmptyDark />}
            title="console_sso.empty_title"
            description="console_sso.empty_description"
            action={addButton}
          />
        }
        onRetry={() => {
          void reload();
          void mutate();
        }}
      />
      {isCreating && user && !userError && (
        <CreationModal
          key={user.id}
          userId={user.id}
          onClose={(id) => {
            setIsCreating(false);
            if (id) {
              navigate(`${consoleSsoPath}/${id}/connection`);
            }
          }}
        />
      )}
    </>
  );
}

export default ConsoleSso;
