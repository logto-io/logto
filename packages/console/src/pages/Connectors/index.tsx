import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import placeholder from '@/assets/images/social-connectors-placeholder.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import TabNav, { TabNavLink } from '@/components/TabNav';
import TableError from '@/components/Table/TableError';
import TableLoading, { ItemPreviewLoading } from '@/components/Table/TableLoading';
import { RequestError } from '@/hooks/use-api';

import ConnectorRow from './components/ConnectorRow';
import SetupModal from './components/SetupModal';
import * as styles from './index.module.scss';

const Connectors = () => {
  const location = useLocation();
  const isSocial = location.pathname === '/connectors/social';
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [createType, setCreateType] = useState<ConnectorType>();
  const { data, error, mutate } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;

  const emailConnector = useMemo(
    () =>
      data?.find(
        (connector) => connector.enabled && connector.metadata.type === ConnectorType.Email
      ),
    [data]
  );

  const smsConnector = useMemo(
    () =>
      data?.find((connector) => connector.enabled && connector.metadata.type === ConnectorType.SMS),
    [data]
  );

  const socialConnectors = useMemo(() => {
    if (!isSocial) {
      return;
    }

    return data?.filter((connector) => connector.metadata.type === ConnectorType.Social);
  }, [data, isSocial]);

  return (
    <>
      <Card>
        <div className={styles.headline}>
          <CardTitle title="connectors.title" subtitle="connectors.subtitle" />
          {isSocial && (
            <Button
              title="admin_console.connectors.create"
              type="primary"
              onClick={() => {
                setCreateType(ConnectorType.Social);
              }}
            />
          )}
        </div>
        <TabNav className={styles.tabs}>
          <TabNavLink href="/connectors">{t('connectors.tab_email_sms')}</TabNavLink>
          <TabNavLink href="/connectors/social">{t('connectors.tab_social')}</TabNavLink>
        </TabNav>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.connectorName}>{t('connectors.connector_name')}</th>
              <th>{t('connectors.connector_type')}</th>
              <th>{t('connectors.connector_status')}</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <TableError
                content={error.body.message}
                onTryAgain={() => {
                  void mutate(undefined, true);
                }}
              />
            )}
            {isLoading && (
              <TableLoading>
                <td className={styles.connectorName}>
                  <ItemPreviewLoading />
                </td>
                <td>
                  <div />
                </td>
                <td>
                  <div />
                </td>
              </TableLoading>
            )}
            {socialConnectors?.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <div className={styles.empty}>
                    <div>
                      <img src={placeholder} />
                    </div>
                    <div className={styles.emptyLine}>{t('connectors.type.social')}</div>
                    <div className={styles.emptyLine}>{t('connectors.social_connector_eg')}</div>
                    <Button disabled title="admin_console.connectors.create" type="primary" />
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && !isSocial && (
              <ConnectorRow
                connector={emailConnector}
                type={ConnectorType.Email}
                onClickSetup={() => {
                  setCreateType(ConnectorType.Email);
                }}
              />
            )}
            {!isLoading && !isSocial && (
              <ConnectorRow connector={smsConnector} type={ConnectorType.SMS} />
            )}
            {socialConnectors?.map((connector) => (
              <ConnectorRow key={connector.id} connector={connector} type={ConnectorType.Social} />
            ))}
          </tbody>
        </table>
      </Card>
      {data && (
        <SetupModal
          isOpen={Boolean(createType)}
          type={createType}
          onClose={() => {
            setCreateType(undefined);
          }}
        />
      )}
    </>
  );
};

export default Connectors;
