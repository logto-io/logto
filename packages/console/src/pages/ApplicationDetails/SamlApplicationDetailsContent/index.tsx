import {
  type ApplicationResponse,
  ApplicationType,
  type SamlApplicationResponse,
} from '@logto/schemas';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import ApplicationIcon from '@/components/ApplicationIcon';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Skeleton from '@/components/FormCard/Skeleton';
import RequestDataError from '@/components/RequestDataError';
import { ApplicationDetailsTabs } from '@/consts';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { applicationTypeI18nKey } from '@/types/applications';

import Branding from '../components/Branding';

import AttributeMapping from './AttributeMapping';
import Settings from './Settings';
import styles from './index.module.scss';

type SamlApplication = Omit<ApplicationResponse, 'type'> & {
  type: ApplicationType.SAML;
};

export const isSamlApplication = (data: ApplicationResponse): data is SamlApplication =>
  data.type === ApplicationType.SAML;

type Props = {
  readonly data: SamlApplication;
};

function SamlApplicationDetailsContent({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { navigate } = useTenantPathname();

  const {
    data: samlApplicationData,
    error: samlApplicationError,
    mutate: mutateSamlApplication,
  } = useSWR<SamlApplicationResponse, RequestError>(`api/saml-applications/${data.id}`);

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const api = useApi();

  const isLoading = !samlApplicationData && !samlApplicationError;

  const onDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await api.delete(`api/saml-applications/${data.id}`);
      setIsDeleted(true);
      setIsDeleteFormOpen(false);
      toast.success(
        t('application_details.application_deleted', { name: samlApplicationData?.name })
      );
      navigate(
        samlApplicationData?.isThirdParty
          ? '/applications/third-party-applications'
          : '/applications'
      );
    } finally {
      setIsDeleting(false);
    }
  }, [api, data.id, navigate, samlApplicationData?.isThirdParty, samlApplicationData?.name, t]);

  if (isLoading) {
    return <Skeleton />;
  }

  if (samlApplicationError) {
    return (
      <RequestDataError
        error={samlApplicationError}
        onRetry={() => {
          void mutateSamlApplication();
        }}
      />
    );
  }

  return (
    <>
      <DetailsPageHeader
        icon={<ApplicationIcon type={data.type} isThirdParty={data.isThirdParty} />}
        title={data.name}
        primaryTag={t(`${applicationTypeI18nKey[ApplicationType.SAML]}.title`)}
        identifier={{ name: 'App ID', value: data.id }}
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
        <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.AttributeMapping}`}>
          {t('application_details.saml_app_attribute_mapping.name')}
        </TabNavItem>
        <TabNavItem href={`/applications/${data.id}/${ApplicationDetailsTabs.Branding}`}>
          {t('application_details.branding.name')}
        </TabNavItem>
      </TabNav>
      <TabWrapper
        isActive={tab === ApplicationDetailsTabs.Settings}
        className={styles.tabContainer}
      >
        {samlApplicationData && (
          <Settings
            data={samlApplicationData}
            mutateApplication={mutateSamlApplication}
            isDeleted={isDeleted}
          />
        )}
      </TabWrapper>
      <TabWrapper
        isActive={tab === ApplicationDetailsTabs.AttributeMapping}
        className={styles.tabContainer}
      >
        {samlApplicationData && (
          <AttributeMapping data={samlApplicationData} mutateApplication={mutateSamlApplication} />
        )}
      </TabWrapper>
      <TabWrapper
        isActive={tab === ApplicationDetailsTabs.Branding}
        className={styles.tabContainer}
      >
        {/* isActive is needed to support conditional render UnsavedChangesAlertModal */}
        <Branding application={data} isActive={tab === ApplicationDetailsTabs.Branding} />
      </TabWrapper>
    </>
  );
}

export default SamlApplicationDetailsContent;
