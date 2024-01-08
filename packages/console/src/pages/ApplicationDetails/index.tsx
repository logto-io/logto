import { withAppInsights } from '@logto/app-insights/react';
import {
  type Application,
  type ApplicationResponse,
  type SnakeCaseOidcConfig,
  customClientMetadataDefault,
  ApplicationType,
} from '@logto/schemas';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import DetailsForm from '@/components/DetailsForm';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { ApplicationDetailsTabs } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { openIdProviderConfigPath } from '@/consts/oidc';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { applicationTypeI18nKey } from '@/types/applications';
import { trySubmitSafe } from '@/utils/form';

import Branding from './components/Branding';
import EndpointsAndCredentials from './components/EndpointsAndCredentials';
import GuideDrawer from './components/GuideDrawer';
import GuideModal from './components/GuideModal';
import MachineLogs from './components/MachineLogs';
import MachineToMachineApplicationRoles from './components/MachineToMachineApplicationRoles';
import RefreshTokenSettings from './components/RefreshTokenSettings';
import Settings from './components/Settings';
import * as styles from './index.module.scss';

const mapToUriFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri));

const mapToUriOriginFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri.replace(/\/*$/, '')));

function ApplicationDetails() {
  const { id, guideId, tab } = useParams();
  const { navigate, match } = useTenantPathname();
  const isGuideView = !!id && !!guideId && match(`/applications/${id}/guide/${guideId}`);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ApplicationResponse, RequestError>(
    id && `api/applications/${id}`
  );

  const {
    data: oidcConfig,
    error: fetchOidcConfigError,
    mutate: mutateOidcConfig,
  } = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);

  const isLoading = (!data && !error) || (!oidcConfig && !fetchOidcConfigError);
  const requestError = error ?? fetchOidcConfigError;
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const api = useApi();
  const formMethods = useForm<Application & { isAdmin: boolean }>({
    defaultValues: { customClientMetadata: customClientMetadataDefault, isAdmin: false },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data) {
      return;
    }

    if (isDirty) {
      return;
    }

    reset(data);
  }, [data, isDirty, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (!data || isSubmitting) {
        return;
      }

      await api
        .patch(`api/applications/${data.id}`, {
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
      reset(formData);
      void mutate();
      toast.success(t('general.saved'));
    })
  );

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    try {
      await api.delete(`api/applications/${data.id}`);
      setIsDeleted(true);
      setIsDeleting(false);
      setIsDeleteFormOpen(false);
      toast.success(t('application_details.application_deleted', { name: data.name }));
      navigate(`/applications`);
    } catch {
      setIsDeleting(false);
    }
  };

  const onCloseDrawer = () => {
    setIsReadmeOpen(false);
  };

  if (isGuideView) {
    return (
      <GuideModal
        guideId={guideId}
        app={data}
        onClose={() => {
          navigate(`/applications/${id}`);
        }}
      />
    );
  }

  return (
    <DetailsPage
      backLink="/applications"
      backLinkTitle="application_details.back_to_applications"
      isLoading={isLoading}
      error={requestError}
      onRetry={() => {
        void mutate();
        void mutateOidcConfig();
      }}
    >
      <PageMeta titleKey="application_details.page_title" />
      {data && oidcConfig && (
        <>
          <DetailsPageHeader
            icon={<ApplicationIcon type={data.type} />}
            title={data.name}
            primaryTag={t(`${applicationTypeI18nKey[data.type]}.title`)}
            identifier={{ name: 'App ID', value: data.id }}
            additionalActionButton={{
              title: 'application_details.check_guide',
              icon: <File />,
              onClick: () => {
                setIsReadmeOpen(true);
              },
            }}
            actionMenuItems={[
              {
                type: 'danger',
                title: 'general.delete',
                icon: <Delete />,
                onClick: () => {
                  setIsDeleteFormOpen(true);
                },
              },
            ]}
          />
          <Drawer isOpen={isReadmeOpen} onClose={onCloseDrawer}>
            <GuideDrawer app={data} onClose={onCloseDrawer} />
          </Drawer>
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
          <TabNav>
            <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Settings}`}>
              {t('application_details.settings')}
            </TabNavItem>
            {data.type === ApplicationType.MachineToMachine && (
              <>
                <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Roles}`}>
                  {t('application_details.application_roles')}
                </TabNavItem>
                <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Logs}`}>
                  {t('application_details.machine_logs')}
                </TabNavItem>
              </>
            )}
            {isDevFeaturesEnabled && data.isThirdParty && (
              <>
                <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Permissions}`}>
                  {t('application_details.permissions.name')}
                </TabNavItem>
                <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Branding}`}>
                  {t('application_details.branding.name')}
                </TabNavItem>
              </>
            )}
          </TabNav>
          <TabWrapper
            isActive={tab === ApplicationDetailsTabs.Settings}
            className={styles.tabContainer}
          >
            <FormProvider {...formMethods}>
              <DetailsForm
                isDirty={isDirty}
                isSubmitting={isSubmitting}
                onDiscard={reset}
                onSubmit={onSubmit}
              >
                <Settings data={data} />
                <EndpointsAndCredentials app={data} oidcConfig={oidcConfig} />
                {data.type !== ApplicationType.MachineToMachine && (
                  <RefreshTokenSettings data={data} />
                )}
              </DetailsForm>
            </FormProvider>
          </TabWrapper>

          {data.type === ApplicationType.MachineToMachine && (
            <>
              <TabWrapper
                isActive={tab === ApplicationDetailsTabs.Roles}
                className={styles.tabContainer}
              >
                <MachineToMachineApplicationRoles application={data} />
              </TabWrapper>
              <TabWrapper
                isActive={tab === ApplicationDetailsTabs.Logs}
                className={styles.tabContainer}
              >
                <MachineLogs applicationId={data.id} />
              </TabWrapper>
            </>
          )}

          {isDevFeaturesEnabled && data.isThirdParty && (
            <>
              <TabWrapper
                isActive={tab === ApplicationDetailsTabs.Permissions}
                className={styles.tabContainer}
              >
                <div>Permissions</div>
              </TabWrapper>
              <TabWrapper
                isActive={tab === ApplicationDetailsTabs.Branding}
                className={styles.tabContainer}
              >
                <Branding application={data} />
              </TabWrapper>
            </>
          )}
        </>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
    </DetailsPage>
  );
}

export default withAppInsights(ApplicationDetails);
