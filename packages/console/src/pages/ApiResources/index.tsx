import { Resource } from '@logto/schemas';
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
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const buildDetailsLink = (id: string) => `/api-resources/${id}`;

const ApiResources = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Resource[], RequestError>('/api/resources');
  const isLoading = !data && !error;
  const navigate = useNavigate();

  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="api_resources.title" subtitle="api_resources.subtitle" />
        <Button
          title="admin_console.api_resources.create"
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
            onClose={(createdApiResource) => {
              setIsCreateFormOpen(false);

              if (createdApiResource) {
                void mutate(conditional(data && [...data, createdApiResource]));
                toast.success(
                  t('api_resources.api_resource_created', { name: createdApiResource.name })
                );
                navigate(buildDetailsLink(createdApiResource.id));
              }
            }}
          />
        </Modal>
      </div>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.apiResourceName} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>{t('api_resources.api_name')}</th>
            <th>{t('api_resources.api_identifier')}</th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <TableError
              content={error.body.message}
              onRetry={async () => mutate(undefined, true)}
            />
          )}
          {isLoading && <TableLoading columns={2} />}
          {data?.map(({ id, name, indicator }) => (
            <tr
              key={id}
              className={styles.clickable}
              onClick={() => {
                navigate(buildDetailsLink(id));
              }}
            >
              <td>
                <ItemPreview title={name} icon={<ImagePlaceholder />} to={buildDetailsLink(id)} />
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
