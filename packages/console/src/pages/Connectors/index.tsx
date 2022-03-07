import { ConnectorDTO } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';
import { RequestError } from '@/swr';

import * as styles from './index.module.scss';

const Connectors = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="connectors.title" subtitle="connectors.subtitle" />
        <Button disabled title="admin_console.connectors.create" />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.connectorName}>{t('connectors.connector_name')}</td>
            <td>{t('connectors.connector_status')}</td>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={2}>error occurred: {error.metadata.code}</td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td colSpan={2}>loading</td>
            </tr>
          )}
          {data?.map(({ id, metadata: { name, logo }, enabled }) => (
            <tr key={id}>
              <td>
                <Link to={`/connectors/${id}`} className={styles.link}>
                  <ItemPreview
                    title={name[i18n.language] ?? name.en ?? '-'}
                    subtitle={id}
                    icon={
                      logo.startsWith('http') ? (
                        <img className={styles.logo} src={logo} />
                      ) : (
                        <ImagePlaceholder />
                      )
                    }
                  />
                </Link>
              </td>
              <td>
                {enabled
                  ? t('connectors.connector_status_enabled')
                  : t('connectors.connector_status_disabled')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default Connectors;
