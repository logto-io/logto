import {
  ApplicationType,
  type ApplicationResponse,
  type SnakeCaseOidcConfig,
} from '@logto/schemas';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import DetailsForm from '@/components/DetailsForm';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import OrganizationList from '@/components/OrganizationList';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { ApplicationDetailsTabs, logtoThirdPartyGuideLink, protectedAppLink } from '@/consts';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import { organizations } from '@/hooks/use-console-routes/routes/organizations';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { applicationTypeI18nKey } from '@/types/applications';
import { trySubmitSafe } from '@/utils/form';

import BackchannelLogout from './BackchannelLogout';
import Branding from './Branding';
import EndpointsAndCredentials from './EndpointsAndCredentials';
import GuideDrawer from './GuideDrawer';
import MachineLogs from './MachineLogs';
import MachineToMachineApplicationRoles from './MachineToMachineApplicationRoles';
import Permissions from './Permissions';
import RefreshTokenSettings from './RefreshTokenSettings';
import Settings from './Settings';
import * as styles from './index.module.scss';
import { type ApplicationForm, applicationFormDataParser } from './utils';

type Props = {
  readonly data: ApplicationResponse;
  readonly oidcConfig: SnakeCaseOidcConfig;
  readonly onApplicationUpdated: () => void;
};

function ApplicationDetailsContent({ data, oidcConfig, onApplicationUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { navigate } = useTenantPathname();
  const { getDocumentationUrl } = useDocumentationUrl();

  const formMethods = useForm<ApplicationForm>({
    defaultValues: applicationFormDataParser.fromResponse(data),
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const updatedData = await api
        .patch(`api/applications/${data.id}`, {
          json: applicationFormDataParser.toRequestPayload(formData),
        })
        .json<ApplicationResponse>();
      reset(applicationFormDataParser.fromResponse(updatedData));
      onApplicationUpdated();
      toast.success(t('general.saved'));
    })
  );

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`api/applications/${data.id}`);
      setIsDeleted(true);
      setIsDeleteFormOpen(false);
      toast.success(t('application_details.application_deleted', { name: data.name }));
      navigate(`/applications`);
    } finally {
      setIsDeleting(false);
    }
  };

  const onCloseDrawer = () => {
    // The guide drawer may have updated the application data
    onApplicationUpdated();
    setIsReadmeOpen(false);
  };

  return (
    <>
      <DetailsPageHeader
        icon={<ApplicationIcon type={data.type} isThirdParty={data.isThirdParty} />}
        title={data.name}
        primaryTag={
          data.isThirdParty
            ? t(`${applicationTypeI18nKey.thirdParty}.title`)
            : t(`${applicationTypeI18nKey[data.type]}.title`)
        }
        identifier={{ name: 'App ID', value: data.id }}
        additionalActionButton={{
          title: 'application_details.check_guide',
          icon: <File />,
          onClick: () => {
            // Open IdP docs link in new tab if it's a third party app
            if (data.isThirdParty) {
              window.open(getDocumentationUrl(logtoThirdPartyGuideLink), '_blank');
              return;
            }
            // Open protected app docs link in new tab
            if (data.type === ApplicationType.Protected) {
              window.open(getDocumentationUrl(protectedAppLink), '_blank');
              return;
            }

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
              {t('roles.col_roles')}
            </TabNavItem>
            <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Logs}`}>
              {t('application_details.machine_logs')}
            </TabNavItem>
            <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Organizations}`}>
              {t('organizations.title')}
            </TabNavItem>
          </>
        )}
        {data.isThirdParty && (
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
            {/* Protected apps will reference this section in <ProtectedAppSettings /> component */}
            {data.type !== ApplicationType.Protected && (
              <EndpointsAndCredentials app={data} oidcConfig={oidcConfig} />
            )}
            {![ApplicationType.MachineToMachine, ApplicationType.Protected].includes(data.type) && (
              <RefreshTokenSettings data={data} />
            )}
            {data.type !== ApplicationType.MachineToMachine && <BackchannelLogout />}
          </DetailsForm>
        </FormProvider>
        {tab === ApplicationDetailsTabs.Settings && (
          <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
        )}
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
          <TabWrapper
            isActive={tab === ApplicationDetailsTabs.Organizations}
            className={styles.tabContainer}
          >
            <OrganizationList
              type="application"
              data={data}
              placeholder={
                <EmptyDataPlaceholder
                  title={
                    <Trans
                      i18nKey="admin_console.application_details.no_organization_placeholder"
                      components={{ a: <TextLink to={'/' + organizations.path} /> }}
                    />
                  }
                />
              }
            />
          </TabWrapper>
        </>
      )}
      {data.isThirdParty && (
        <>
          <TabWrapper
            isActive={tab === ApplicationDetailsTabs.Permissions}
            className={styles.tabContainer}
          >
            <Permissions application={data} />
          </TabWrapper>
          <TabWrapper
            isActive={tab === ApplicationDetailsTabs.Branding}
            className={styles.tabContainer}
          >
            {/* isActive is needed to support conditional render UnsavedChangesAlertModal */}
            <Branding application={data} isActive={tab === ApplicationDetailsTabs.Branding} />
          </TabWrapper>
        </>
      )}
    </>
  );
}

export default ApplicationDetailsContent;
