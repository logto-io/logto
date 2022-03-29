import { Application } from '@logto/schemas';
import { conditional } from '@silverhand/essentials/lib/utilities/conditional.js';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const Applications = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Application[], RequestError>('/api/applications');
  const isLoading = !data && !error;
  const navigate = useNavigate();

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button
          title="admin_console.applications.create"
          type="primary"
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

                toast.success(t('applications.application_created', { name: createdApp.name }));
                navigate(`/applications/${createdApp.id}`);
              }
            }}
          />
        </Modal>
      </div>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.applicationName} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>{t('applications.application_name')}</th>
            <th>{t('applications.client_id')}</th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <TableError
              columns={2}
              content={error.body.message}
              onRetry={async () => mutate(undefined, true)}
            />
          )}
          {isLoading && <TableLoading columns={2} />}
          {data?.length === 0 && (
            <TableEmpty columns={2}>
              <Button
                title="admin_console.applications.create"
                type="outline"
                onClick={() => {
                  setIsCreateFormOpen(true);
                }}
              />
            </TableEmpty>
          )}
          {data?.map(({ id, name, type }) => (
            <tr
              key={id}
              className={styles.clickable}
              onClick={() => {
                navigate(`/applications/${id}`);
              }}
            >
              <td>
                <ItemPreview
                  title={name}
                  subtitle={t(`${applicationTypeI18nKey[type]}.title`)}
                  icon={<ImagePlaceholder />}
                  to={`/applications/${id}`}
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
