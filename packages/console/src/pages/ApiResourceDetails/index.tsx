import { Resource } from '@logto/schemas';
import ky from 'ky';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { RequestError } from '@/swr';

import * as styles from './index.module.scss';

type FormData = {
  name: string;
  accessTokenTtl: number;
};

const ApiResourceDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { data, error, mutate } = useSWR<Resource, RequestError>(id && `/api/resources/${id}`);
  const isLoading = !data && !error;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { handleSubmit, register, reset } = useForm<FormData>({
    defaultValues: data,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data) {
      return;
    }

    try {
      const updatedApiResource = await ky
        .patch(`/api/resources/${data.id}`, { json: formData })
        .json<Resource>();
      void mutate(updatedApiResource);
    } catch (error: unknown) {
      console.error(error);
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
                  <TextInput {...register('accessTokenTtl', { required: true })} />
                </FormField>
              </div>
              <div className={styles.submit}>
                <Button
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
