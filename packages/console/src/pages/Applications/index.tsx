import { Application } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';
import { RequestError } from '@/swr';
import { applicationTypeI18nKey } from '@/types/applications';

import * as styles from './index.module.scss';

const Applications = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<Application[], RequestError>('/api/applications');
  const isLoading = !data && !error;

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button disabled title="admin_console.applications.create" />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.applicationName}>{t('applications.application_name')}</td>
            <td>{t('applications.application_name')}</td>
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
          {data?.map(({ id, name, type }) => (
            <tr key={id}>
              <td>
                <ItemPreview
                  title={name}
                  subtitle={t(applicationTypeI18nKey[type])}
                  icon={<ImagePlaceholder />}
                />
              </td>
              <td>
                <CopyToClipboard value={id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default Applications;
