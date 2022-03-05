import { Resource } from '@logto/schemas';
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

import * as styles from './index.module.scss';

const ApiResources = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<Resource[], RequestError>('/api/resources');
  const isLoading = !data && !error;

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="api_resources.title" subtitle="api_resources.subtitle" />
        <Button disabled title="admin_console.api_resources.create" />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.apiResourceName}>{t('api_resources.api_name')}</td>
            <td>{t('api_resources.api_identifier')}</td>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={2}>error occured: {error.metadata.code}</td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td colSpan={2}>loading</td>
            </tr>
          )}
          {data?.map(({ id, name, indicator }) => (
            <tr key={id} className={styles.clickable}>
              <td>
                <ItemPreview title={name} icon={<ImagePlaceholder />} />
              </td>
              <td>
                <CopyToClipboard value={indicator} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default ApiResources;
