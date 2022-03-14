import { Application } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import BackLink from '@/components/BackLink';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { RequestError } from '@/swr';
import { applicationTypeI18nKey } from '@/types/applications';

import * as styles from './index.module.scss';

const ApplicationDetails = () => {
  const { id } = useParams();
  const { data, error } = useSWR<Application, RequestError>(id && `/api/applications/${id}`);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isLoading = !data && !error;

  return (
    <div className={styles.container}>
      <BackLink to="/applications">{t('application_details.back_to_applications')}</BackLink>
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <Card className={styles.header}>
          <ImagePlaceholder size={76} borderRadius={16} />
          <div className={styles.metadata}>
            <div className={styles.name}>{data.name}</div>
            <div>
              <div className={styles.type}>{t(`${applicationTypeI18nKey[data.type]}.title`)}</div>
              <div className={styles.verticalBar} />
              <div className={styles.text}>App ID</div>
              <CopyToClipboard value={data.id} className={styles.copy} />
            </div>
          </div>
          <div>
            <Button title="admin_console.application_details.check_help_guide" />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetails;
