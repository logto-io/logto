import { User } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import BackLink from '@/components/BackLink';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { RequestError } from '@/hooks/use-api';

import CreateSuccess from './components/CreateSuccess';
import * as styles from './index.module.scss';

const UserDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data, error } = useSWR<User, RequestError>(id && `/api/users/${id}`);
  const isLoading = !data && !error;

  return (
    <div className={styles.container}>
      <BackLink to="/users">{t('user_details.back_to_users')}</BackLink>

      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <ImagePlaceholder size={76} borderRadius={16} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name ?? '-'}</div>
              <div>
                <div className={styles.username}>{data.username}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>User ID</div>
                <CopyToClipboard value={data.id} className={styles.copy} />
              </div>
            </div>
          </Card>
          <Card>TBD</Card>
        </>
      )}
      {data && <CreateSuccess username={data.username ?? '-'} />}
    </div>
  );
};

export default UserDetails;
