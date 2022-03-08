import { Application } from '@logto/schemas';
import { conditional } from '@silverhand/essentials/lib/utilities/conditional.js';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';
import * as modalStyles from '@/scss/modal.module.scss';
import { RequestError } from '@/swr';
import { applicationTypeI18nKey } from '@/types/applications';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const Applications = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Application[], RequestError>('/api/applications');
  const isLoading = !data && !error;

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button
          title="admin_console.applications.create"
          onClick={() => {
            setIsCreateFormOpen(true);
          }}
        />
        <Modal
          isOpen={isCreateFormOpen}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
        >
          <CreateForm
            onClose={(createdApp) => {
              setIsCreateFormOpen(false);

              if (createdApp) {
                void mutate(conditional(data && [...data, createdApp]));
              }
            }}
          />
        </Modal>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.applicationName}>{t('applications.application_name')}</td>
            <td>{t('applications.client_id')}</td>
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
                  subtitle={t(`${applicationTypeI18nKey[type]}.title`)}
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
