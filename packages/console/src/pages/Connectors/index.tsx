import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import placeholder from '@/assets/images/social-connectors-placeholder.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import Status from '@/components/Status';
import TabNav, { TabNavLink } from '@/components/TabNav';
import { RequestError } from '@/swr';

import ConnectorName from './components/ConnectorName';
import * as styles from './index.module.scss';

const Connectors = () => {
  const location = useLocation();
  const isSocial = location.pathname === '/connectors/social';
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;

  const emailAndSmsConnectors: Array<[ConnectorDTO | undefined, string]> | undefined =
    useMemo(() => {
      if (isSocial || !data) {
        return;
      }

      return [
        [
          data.find((connector) => connector.metadata.type === ConnectorType.Email),
          t('connectors.type.email'),
        ],
        [
          data.find((connector) => connector.metadata.type === ConnectorType.SMS),
          t('connectors.type.sms'),
        ],
      ];
    }, [data, isSocial, t]);

  const socialConnectors = useMemo(() => {
    if (!isSocial) {
      return;
    }

    return data?.filter((connector) => connector.metadata.type === ConnectorType.Social);
  }, [data, isSocial]);

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="connectors.title" subtitle="connectors.subtitle" />
        {isSocial && <Button disabled title="admin_console.connectors.create" />}
      </div>
      <TabNav>
        <TabNavLink href="/connectors">{t('connectors.tab_email_sms')}</TabNavLink>
        <TabNavLink href="/connectors/social">{t('connectors.tab_social')}</TabNavLink>
      </TabNav>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.connectorName}>{t('connectors.connector_name')}</td>
            <td>{t('connectors.connector_type')}</td>
            <td>{t('connectors.connector_status')}</td>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={3}>error occurred: {error.metadata.code}</td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td colSpan={3}>loading</td>
            </tr>
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
                  <Button disabled title="admin_console.connectors.create" />
                </div>
              </td>
            </tr>
          )}
          {emailAndSmsConnectors?.map(([connector, type]) => (
            <tr key={type}>
              <td>
                <ConnectorName connector={connector} titlePlaceholder={type} />
              </td>
              <td>{type}</td>
              <td>
                {connector ? (
                  <Status status="operational">{t('connectors.connector_status_enabled')}</Status>
                ) : (
                  <Button title="admin_console.connectors.set_up" />
                )}
              </td>
            </tr>
          ))}
          {socialConnectors?.map((connector) => (
            <tr key={connector.id}>
              <td>
                <ConnectorName connector={connector} />
              </td>
              <td>{t('connectors.type.social')}</td>
              <td>
                <Status status={connector.enabled ? 'operational' : 'offline'}>
                  {t(
                    connector.enabled
                      ? 'connectors.connector_status_enabled'
                      : 'connectors.connector_status_disabled'
                  )}
                </Status>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default Connectors;
