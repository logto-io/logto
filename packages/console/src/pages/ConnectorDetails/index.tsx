import { ConnectorDTO } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import BackLink from '@/components/BackLink';
import Card from '@/components/Card';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import Status from '@/components/Status';
import { RequestError } from '@/swr';

import * as styles from './index.module.scss';

const ConnectorDetails = () => {
  const { connectorId } = useParams();
  const {
    t,
    i18n: { language },
  } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<ConnectorDTO, RequestError>(
    connectorId && `/api/connectors/${connectorId}`
  );
  const isLoading = !data && !error;

  return (
    <div className={styles.container}>
      <BackLink to="/connectors">{t('connector_details.back_to_connectors')}</BackLink>
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <Card className={styles.header}>
          {data.metadata.logo.startsWith('http') ? (
            <img src={data.metadata.logo} className={styles.logo} />
          ) : (
            <ImagePlaceholder size={76} borderRadius={16} />
          )}
          <div className={styles.metadata}>
            <div>
              <div className={styles.name}>{data.metadata.name[language]}</div>
              <div className={styles.id}>{data.id}</div>
            </div>
            <div>
              <Status status={data.enabled ? 'operational' : 'offline'}>
                {t('connectors.connector_status', {
                  context: data.enabled ? 'enabled' : 'disabled',
                })}
              </Status>
            </div>
          </div>
          <div>action</div>
        </Card>
      )}
    </div>
  );
};

export default ConnectorDetails;
