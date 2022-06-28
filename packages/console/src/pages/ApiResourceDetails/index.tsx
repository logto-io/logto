import { AppearanceMode, Resource } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/images/api-resource-dark.svg';
import ApiResource from '@/assets/images/api-resource.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import FormField from '@/components/FormField';
import LinkButton from '@/components/LinkButton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import useApi, { RequestError } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';

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
  const theme = useTheme();
  const Icon = theme === AppearanceMode.LightMode ? ApiResource : ApiResourceDark;

  const isLogtoManagementApiResource = data?.id === managementResource.id;

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: data,
  });

  const api = useApi();

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }
    reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const updatedApiResource = await api
      .patch(`/api/resources/${data.id}`, { json: formData })
      .json<Resource>();
    void mutate(updatedApiResource);
    toast.success(t('general.saved'));
  });

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/api-resources"
        icon={<Back />}
        title="admin_console.api_resource_details.back_to_api_resources"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <div className={styles.info}>
              <Icon className={styles.icon} />
              <div className={styles.meta}>
                <div className={styles.name}>{data.name}</div>
                <CopyToClipboard value={data.indicator} />
              </div>
            </div>
            {!isLogtoManagementApiResource && (
              <div className={styles.operations}>
                <ActionMenu
                  buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
                  title={t('general.more_options')}
                >
                  <ActionMenuItem
                    icon={<Delete />}
                    type="danger"
                    onClick={() => {
                      setIsDeleteFormOpen(true);
                    }}
                  >
                    {t('general.delete')}
                  </ActionMenuItem>
                </ActionMenu>
                <Modal
                  isOpen={isDeleteFormOpen}
                  className={modalStyles.content}
                  overlayClassName={modalStyles.overlay}
                >
                  <DeleteForm
                    id={data.id}
                    name={data.name}
                    onClose={() => {
                      setIsDeleteFormOpen(false);
                    }}
                  />
                </Modal>
              </div>
            )}
          </Card>
          <Card className={classNames(styles.body, detailsStyles.body)}>
            <TabNav>
              <TabNavItem href={location.pathname}>{t('api_resource_details.settings')}</TabNavItem>
            </TabNav>
            <form className={classNames(styles.form, detailsStyles.body)} onSubmit={onSubmit}>
              <div className={styles.fields}>
                <FormField
                  isRequired
                  title="admin_console.api_resources.api_name"
                  className={styles.textField}
                >
                  <TextInput
                    {...register('name', { required: true })}
                    hasError={Boolean(errors.name)}
                    readOnly={isLogtoManagementApiResource}
                  />
                </FormField>
                <FormField
                  isRequired
                  title="admin_console.api_resource_details.token_expiration_time_in_seconds"
                  className={styles.textField}
                >
                  <TextInput
                    {...register('accessTokenTtl', { required: true, valueAsNumber: true })}
                    hasError={Boolean(errors.accessTokenTtl)}
                  />
                </FormField>
              </div>
              <div className={detailsStyles.footer}>
                <div className={detailsStyles.footerMain}>
                  <Button
                    isLoading={isSubmitting}
                    htmlType="submit"
                    type="primary"
                    title="admin_console.general.save_changes"
                    size="large"
                  />
                </div>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};

export default ApiResourceDetails;
