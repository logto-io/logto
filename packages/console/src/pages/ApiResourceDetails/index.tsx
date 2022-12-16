import type { Resource } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/images/api-resource-dark.svg';
import ApiResource from '@/assets/images/api-resource.svg';
import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DetailsForm from '@/components/DetailsForm';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import * as detailsStyles from '@/scss/details.module.scss';
import { getApiResourcesPathname } from '@/utilities/router';

import * as styles from './index.module.scss';

type FormData = {
  name: string;
  accessTokenTtl: number;
};

const ApiResourceDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data, error, mutate } = useSWR<Resource, RequestError>(id && `/api/resources/${id}`);
  const isLoading = !data && !error;
  const theme = useTheme();
  const Icon = theme === AppearanceMode.LightMode ? ApiResource : ApiResourceDark;

  const isLogtoManagementApiResource = data?.id === managementResource.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isSubmitting, errors },
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

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/api/resources/${data.id}`);
      setIsDeleted(true);
      setIsDeleting(false);
      setIsDeleteFormOpen(false);
      toast.success(t('api_resource_details.api_resource_deleted', { name: data.name }));
      navigate(getApiResourcesPathname());
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className={detailsStyles.container}>
      <TextLink to={getApiResourcesPathname()} icon={<Back />} className={styles.backLink}>
        {t('api_resource_details.back_to_api_resources')}
      </TextLink>
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <div className={styles.info}>
              <Icon className={styles.icon} />
              <div className={styles.meta}>
                <div className={styles.name}>{data.name}</div>
                <CopyToClipboard size="small" value={data.indicator} />
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
                <DeleteConfirmModal
                  isOpen={isDeleteFormOpen}
                  isLoading={isDeleting}
                  expectedInput={data.name}
                  className={styles.deleteConfirm}
                  inputPlaceholder={t('api_resource_details.enter_your_api_resource_name')}
                  onCancel={() => {
                    setIsDeleteFormOpen(false);
                  }}
                  onConfirm={onDelete}
                >
                  <div className={styles.description}>
                    <Trans components={{ span: <span className={styles.highlight} /> }}>
                      {t('api_resource_details.delete_description', { name: data.name })}
                    </Trans>
                  </div>
                </DeleteConfirmModal>
              </div>
            )}
          </Card>
          <TabNav>
            <TabNavItem href={location.pathname}>{t('general.settings_nav')}</TabNavItem>
          </TabNav>
          <DetailsForm
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            onDiscard={reset}
            onSubmit={onSubmit}
          >
            <FormCard
              title="api_resource_details.settings"
              description="api_resource_details.settings_description"
              learnMoreLink="https://docs.logto.io/docs/recipes/protect-your-api"
            >
              <FormField isRequired title="api_resources.api_name">
                <TextInput
                  {...register('name', { required: true })}
                  hasError={Boolean(errors.name)}
                  readOnly={isLogtoManagementApiResource}
                  placeholder={t('api_resources.api_name_placeholder')}
                />
              </FormField>
              <FormField isRequired title="api_resource_details.token_expiration_time_in_seconds">
                <TextInput
                  {...register('accessTokenTtl', { required: true, valueAsNumber: true })}
                  hasError={Boolean(errors.accessTokenTtl)}
                  placeholder={t(
                    'api_resource_details.token_expiration_time_in_seconds_placeholder'
                  )}
                />
              </FormField>
            </FormCard>
          </DetailsForm>
        </>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </div>
  );
};

export default ApiResourceDetails;
