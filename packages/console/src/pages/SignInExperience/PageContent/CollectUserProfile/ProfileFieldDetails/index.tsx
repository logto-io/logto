import { type CustomProfileField } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import PageMeta from '@/components/PageMeta';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabWrapper from '@/ds-components/TabWrapper';
import { type RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { useDataParser } from '../hooks';
import { isBuiltInCustomProfileFieldKey } from '../utils';

import ProfileFieldDetailsForm from './ProfileFieldDetailsForm';
import styles from './index.module.scss';

const parentPathname = '/sign-in-experience/collect-user-profile';

function ProfileFieldDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { fieldName } = useParams();
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { navigate } = useTenantPathname();

  const isBuiltInFieldName = isBuiltInCustomProfileFieldKey(fieldName);

  const { data, error, mutate, isLoading } = useSWR<CustomProfileField, RequestError>(
    `api/custom-profile-fields/${fieldName}`
  );

  const { getDefaultLabel } = useDataParser();

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const onDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      await api.delete(`api/custom-profile-fields/${fieldName}`);
      setIsDeleted(true);
      setIsDeleteFormOpen(false);
      toast.success(
        t('sign_in_exp.custom_profile_fields.details.field_deleted', { name: data?.name })
      );
      await mutateGlobal('api/custom-profile-fields', true);
      navigate(parentPathname);
    } finally {
      setIsDeleting(false);
    }
  }, [api, fieldName, t, data?.name, navigate, mutateGlobal]);

  if (!fieldName) {
    return null;
  }

  return (
    <DetailsPage
      backLink={parentPathname}
      backLinkTitle="sign_in_exp.custom_profile_fields.details.back_to_sie"
      isLoading={isLoading}
      error={error}
      onRetry={mutate}
    >
      <PageMeta titleKey="sign_in_exp.custom_profile_fields.details.page_title" />
      <DetailsPageHeader
        title={data?.label ?? getDefaultLabel(fieldName)}
        identifier={{
          name: t('sign_in_exp.custom_profile_fields.details.key'),
          tags: data?.config.parts
            ?.filter(({ enabled }) => enabled)
            .map(({ name }) => (fieldName === 'address' ? `address.${name}` : name)) ?? [
            isBuiltInFieldName ? fieldName : `customData.${fieldName}`,
          ],
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
      <DeleteConfirmModal
        isOpen={isDeleteFormOpen}
        isLoading={isDeleting}
        onCancel={() => {
          setIsDeleteFormOpen(false);
        }}
        onConfirm={onDelete}
      >
        {t('sign_in_exp.custom_profile_fields.details.delete_description')}
      </DeleteConfirmModal>
      <TabWrapper isActive className={styles.tabContainer}>
        {data && <ProfileFieldDetailsForm data={data} isDeleted={isDeleted} />}
      </TabWrapper>
    </DetailsPage>
  );
}

export default ProfileFieldDetails;
