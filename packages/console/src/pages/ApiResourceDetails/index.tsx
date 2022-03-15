import { Resource } from '@logto/schemas';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import BackLink from '@/components/BackLink';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import TabNav, { TabNavLink } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import * as modalStyles from '@/scss/modal.module.scss';
import { RequestError } from '@/swr';
import api from '@/utilities/api';

import DeleteForm from './components/DeleteForm';
import * as styles from './index.module.scss';

type FormData = {
  name: string;
  accessTokenTtl: number;
};

const ApiResourceDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data, error, mutate } = useSWR<Resource, RequestError>(id && `/api/resources/${id}`);
  const isLoading = !data && !error;

  const { handleSubmit, register, reset } = useForm<FormData>({
    defaultValues: data,
  });
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }
    reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || submitting) {
      return;
    }
    setSubmitting(true);

    try {
      const updatedApiResource = await api
        .patch(`/api/resources/${data.id}`, { json: formData })
        .json<Resource>();
      void mutate(updatedApiResource);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className={styles.container}>
      <BackLink to="/api-resources">{t('api_resource_details.back_to_api_resources')}</BackLink>

      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <div className={styles.info}>
              <ImagePlaceholder size={76} borderRadius={16} />
              <div className={styles.meta}>
                <div className={styles.name}>{data.name}</div>
                <CopyToClipboard value={data.indicator} />
              </div>
            </div>
            <div className={styles.operation}>
              <Button title="admin_console.api_resource_details.check_help_guide" />
              <Modal
                isOpen={isDeleteOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <DeleteForm
                  id={data.id}
                  name={data.name}
                  onClose={() => {
                    setIsDeleteOpen(false);
                  }}
                />
              </Modal>
            </div>
          </Card>
          <Card className={styles.body}>
            <TabNav>
              <TabNavLink href={location.pathname}>{t('api_resource_details.settings')}</TabNavLink>
            </TabNav>
            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.fields}>
                <FormField
                  isRequired
                  title="admin_console.api_resources.api_name"
                  className={styles.textField}
                >
                  <TextInput {...register('name', { required: true })} />
                </FormField>
                <FormField
                  isRequired
                  title="admin_console.api_resource_details.token_expiration_time_in_seconds"
                  className={styles.textField}
                >
                  <TextInput
                    {...register('accessTokenTtl', { required: true, valueAsNumber: true })}
                  />
                </FormField>
              </div>
              <div className={styles.submit}>
                <Button
                  disabled={submitting}
                  htmlType="submit"
                  type="primary"
                  title="admin_console.api_resource_details.save_changes"
                  size="large"
                />
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};

export default ApiResourceDetails;
