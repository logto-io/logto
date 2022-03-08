import { Application } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import * as buttonStyles from '@/components/TextButton/index.module.scss';
import { RequestError } from '@/swr';
import { applicationTypeI18nKey } from '@/types/applications';

import Back from './icons/Back';
import * as styles from './index.module.scss';

const ApplicationDetails = () => {
  const { id } = useParams();
  const { data, error } = useSWR<Application, RequestError>(id && `/api/applications/${id}`);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isLoading = !data && !error;

  return (
    <div className={styles.container}>
      <Link to="/applications" className={classNames(buttonStyles.button, styles.button)}>
        <div className={styles.body}>
          <Back />
          <div>{t('application_details.back_to_applications')}</div>
        </div>
      </Link>
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <Card className={styles.header}>
          <ImagePlaceholder size={76} borderRadius={16} />
          <div className={styles.metadata}>
            <div>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.type}>{t(`${applicationTypeI18nKey[data.type]}.title`)}</div>
            </div>
            <div>
              <div className={styles.type}>ID</div>
              <CopyToClipboard value={data.id} />
            </div>
          </div>
          <div>action</div>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetails;
