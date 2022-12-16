import type { Application, SnakeCaseOidcConfig } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import ApplicationIcon from '@/components/ApplicationIcon';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DetailsForm from '@/components/DetailsForm';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import Drawer from '@/components/Drawer';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextLink from '@/components/TextLink';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import * as detailsStyles from '@/scss/details.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { getApplicationDetailsPathname, getApplicationsPathname } from '@/utilities/router';

import Guide from '../Applications/components/Guide';
import AdvancedSettings from './components/AdvancedSettings';
import Settings from './components/Settings';
import * as styles from './index.module.scss';

const mapToUriFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri));

const mapToUriOriginFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(new URL(uri).origin));

const ApplicationDetails = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Application, RequestError>(
    id && `/api/applications/${id}`
  );
  const { data: oidcConfig, error: fetchOidcConfigError } = useSWR<
    SnakeCaseOidcConfig,
    RequestError
  >('/oidc/.well-known/openid-configuration');
  const isLoading = (!data && !error) || (!oidcConfig && !fetchOidcConfigError);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const api = useApi();
  const navigate = useNavigate();
  const formMethods = useForm<Application>();
  const documentationUrl = useDocumentationUrl();

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

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

    const updatedApplication = await api
      .patch(`/api/applications/${data.id}`, {
        json: {
          ...formData,
          oidcClientMetadata: {
            ...formData.oidcClientMetadata,
            redirectUris: mapToUriFormatArrays(formData.oidcClientMetadata.redirectUris),
            postLogoutRedirectUris: mapToUriFormatArrays(
              formData.oidcClientMetadata.postLogoutRedirectUris
            ),
          },
          customClientMetadata: {
            ...formData.customClientMetadata,
            corsAllowedOrigins: mapToUriOriginFormatArrays(
              formData.customClientMetadata.corsAllowedOrigins
            ),
          },
        },
      })
      .json<Application>();
    void mutate(updatedApplication);
    toast.success(t('general.saved'));
  });

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    try {
      await api.delete(`/api/applications/${data.id}`);
      setIsDeleted(true);
      setIsDeleting(false);
      setIsDeleteFormOpen(false);
      toast.success(t('application_details.application_deleted', { name: data.name }));
      navigate(getApplicationsPathname());
    } catch {
      setIsDeleting(false);
    }
  };

  const onCloseDrawer = () => {
    setIsReadmeOpen(false);
  };

  return (
    <div className={detailsStyles.container}>
      <TextLink to={getApplicationsPathname()} icon={<Back />} className={styles.backLink}>
        {t('application_details.back_to_applications')}
      </TextLink>
      {isLoading && <DetailsSkeleton />}
      {data && oidcConfig && (
        <>
          <Card className={styles.header}>
            <ApplicationIcon type={data.type} className={styles.icon} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.details}>
                <div className={styles.type}>{t(`${applicationTypeI18nKey[data.type]}.title`)}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>App ID</div>
                <CopyToClipboard size="small" value={data.id} />
              </div>
            </div>
            <div className={styles.operations}>
              {/* TODO: @Charles figure out a better way to check guide availability */}
              <Button
                title="application_details.check_guide"
                size="large"
                onClick={() => {
                  if (data.type === ApplicationType.MachineToMachine) {
                    window.open(
                      `${documentationUrl}/docs/recipes/integrate-logto/machine-to-machine/`,
                      '_blank'
                    );

                    return;
                  }
                  setIsReadmeOpen(true);
                }}
              />
              <Drawer isOpen={isReadmeOpen} onClose={onCloseDrawer}>
                <Guide isCompact app={data} onClose={onCloseDrawer} />
              </Drawer>
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
                inputPlaceholder={t('application_details.enter_your_application_name')}
                className={styles.deleteConfirm}
                onCancel={() => {
                  setIsDeleteFormOpen(false);
                }}
                onConfirm={onDelete}
              >
                <div className={styles.description}>
                  <Trans components={{ span: <span className={styles.highlight} /> }}>
                    {t('application_details.delete_description', { name: data.name })}
                  </Trans>
                </div>
              </DeleteConfirmModal>
            </div>
          </Card>
          <TabNav>
            <TabNavItem href={getApplicationDetailsPathname(data.id)}>
              {t('general.settings_nav')}
            </TabNavItem>
          </TabNav>
          <FormProvider {...formMethods}>
            <DetailsForm
              isDirty={isDirty}
              isSubmitting={isSubmitting}
              onDiscard={reset}
              onSubmit={onSubmit}
            >
              <Settings data={data} />
              <AdvancedSettings applicationType={data.type} oidcConfig={oidcConfig} />
            </DetailsForm>
          </FormProvider>
        </>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </div>
  );
};

export default ApplicationDetails;
