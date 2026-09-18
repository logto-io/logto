import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg?react';
import EnterpriseSsoConnectorEmptyDark from '@/assets/images/sso-connector-empty-dark.svg?react';
import EnterpriseSsoConnectorEmpty from '@/assets/images/sso-connector-empty.svg?react';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import connectorStyles from '@/pages/EnterpriseSso/index.module.scss';

import CreationModal from './CreationModal';
import DomainTags from './DomainTags';
import styles from './index.module.scss';
import { consoleSsoPath, useConsoleSsoContext, useConsoleSsoConnectors } from './use-console-sso';

function ConsoleSso() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data: context, error: contextError, mutate: refreshContext } = useConsoleSsoContext();
  const { data, error, isLoading, mutate } = useConsoleSsoConnectors();
  const [isCreating, setIsCreating] = useState(false);
  const addButton = (
    <Button
      title="enterprise_sso.create"
      type="primary"
      icon={<Plus />}
      disabled={!context || Boolean(contextError)}
      onClick={() => {
        setIsCreating(true);
      }}
    />
  );
  return (
    <>
      <Table
        rowGroups={[{ key: 'console-sso', data: context && !error ? data : undefined }]}
        rowIndexKey="id"
        isLoading={(!context && !contextError) || isLoading}
        errorMessage={contextError?.message ?? error?.message}
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
          void refreshContext();
          void mutate();
        }}
      />
      {isCreating &&
        context &&
        (context.stripeCustomerId ? (
          <CreationModal
            key={`${context.userId}:${context.stripeCustomerId}`}
            userId={context.userId}
            customerId={context.stripeCustomerId}
            onClose={(id) => {
              setIsCreating(false);
              if (id) {
                navigate(`${consoleSsoPath}/${id}/connection`);
              }
            }}
          />
        ) : (
          <InlineNotification severity="alert">
            <DynamicT forKey="console_sso.no_customer" />
          </InlineNotification>
        ))}
    </>
  );
}

export default ConsoleSso;
