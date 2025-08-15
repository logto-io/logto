import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import DetailsForm from '@/components/DetailsForm';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { collectUserProfile } from '@/consts';
import DangerousRaw from '@/ds-components/DangerousRaw';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabWrapper from '@/ds-components/TabWrapper';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import CompositionPartsSelector from '../../../components/CompositionPartsSelector';
import ProfileFieldPartSubForm from '../../../components/ProfileFieldPartSubForm';
import { collectUserProfilePathname } from '../../consts';
import { parseResponseToFormData, parseFormDataToRequestPayload } from '../../data-parser';
import { type ProfileFieldForm } from '../../types';
import useI18nFieldLabel from '../../use-i18n-field-label';
import { getFieldTags, isBuiltInCustomProfileFieldKey } from '../../utils';

import styles from './index.module.scss';

type Props = {
  readonly data: CustomProfileField;
};

function ProfileFieldDetailsForm({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { navigate } = useTenantPathname();

  const isBuiltInFieldName = isBuiltInCustomProfileFieldKey(data.name);
  const isCompositionType =
    data.type === CustomProfileFieldType.Address || data.type === CustomProfileFieldType.Fullname;

  const formMethods = useForm<ProfileFieldForm>({
    defaultValues: parseResponseToFormData(data),
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const compositionParts = watch('parts');

  const getI18nLabel = useI18nFieldLabel();

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const onDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      await api.delete(`api/custom-profile-fields/${data.name}`);
      setIsDeleted(true);
      setIsDeleteFormOpen(false);
      toast.success(
        t('sign_in_exp.custom_profile_fields.details.field_deleted', { name: data.name })
      );
      await Promise.all([
        mutateGlobal(
          'api/custom-profile-fields',
          (currentData?: CustomProfileField[]) =>
            currentData?.filter((field) => field.name !== data.name) ?? [],
          { revalidate: false }
        ),
        mutateGlobal(`api/custom-profile-fields/${data.name}`, undefined, { revalidate: false }),
      ]);
      navigate(collectUserProfilePathname, { replace: true });
    } finally {
      setIsDeleting(false);
    }
  }, [api, t, data.name, mutateGlobal, navigate]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }
      const payload = parseFormDataToRequestPayload(formData);

      const result = await api
        .put(`api/custom-profile-fields/${formData.name}`, { json: payload })
        .json<CustomProfileField>();

      reset(parseResponseToFormData(result));

      await Promise.all([
        mutateGlobal(
          'api/custom-profile-fields',
          (currentData?: CustomProfileField[]) =>
            currentData?.map((field) => (field.name === formData.name ? result : field)) ?? [],
          { revalidate: false }
        ),
        mutateGlobal(`api/custom-profile-fields/${formData.name}`),
      ]);

      toast.success(t('general.saved'));
    })
  );

  return (
    <>
      <DetailsPageHeader
        title={watch('label') || getI18nLabel(data.name)}
        identifier={{
          name: t('sign_in_exp.custom_profile_fields.details.key'),
          tags: getFieldTags(data.name, compositionParts),
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
      <TabWrapper isActive className={styles.tabContainer}>
        <FormProvider {...formMethods}>
          <DetailsForm
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            onDiscard={reset}
            onSubmit={onSubmit}
          >
            <FormCard
              title="sign_in_exp.custom_profile_fields.details.settings"
              description="sign_in_exp.custom_profile_fields.details.settings_description"
              learnMoreLink={{ href: collectUserProfile }}
            >
              {isCompositionType ? <CompositionPartsSelector /> : <ProfileFieldPartSubForm />}
            </FormCard>

            {/* Dynamic composition parts rendering, specifically for `address` and `fullname` types */}
            {compositionParts?.map(
              ({ name, label, enabled }, index) =>
                enabled && (
                  <FormCard
                    key={`parts.${name}`}
                    title={<DangerousRaw>{label || getI18nLabel(name)}</DangerousRaw>}
                  >
                    <ProfileFieldPartSubForm index={index} />
                  </FormCard>
                )
            )}
          </DetailsForm>
        </FormProvider>
        <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
      </TabWrapper>
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
    </>
  );
}

export default ProfileFieldDetailsForm;
