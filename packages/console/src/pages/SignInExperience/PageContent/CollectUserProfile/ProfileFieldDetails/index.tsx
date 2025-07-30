import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import DetailsForm from '@/components/DetailsForm';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { collectUserProfile } from '@/consts';
import DangerousRaw from '@/ds-components/DangerousRaw';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabWrapper from '@/ds-components/TabWrapper';
import { type RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import CompositionPartsSelector from '../../components/CompositionPartsSelector';
import ProfileFieldPartSubForm from '../../components/ProfileFieldPartSubForm';
import { isBuiltInCustomProfileFieldKey } from '../utils';

import { useDataParser } from './hooks';
import styles from './index.module.scss';
import { type ProfileFieldForm } from './types';

const parentPathname = '/sign-in-experience/collect-user-profile';
const createProfileFieldPathname = `${parentPathname}/create/:fieldName`;
const profileFieldDetailsPathname = `${parentPathname}/fields/:fieldName`;

function ProfileFieldDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { fieldName } = useParams();
  const { navigate, match } = useTenantPathname();
  const isCreating = match(createProfileFieldPathname);
  const isEditing = match(profileFieldDetailsPathname);

  const isBuiltInFieldName = isBuiltInCustomProfileFieldKey(fieldName);

  const {
    data,
    error: requestError,
    mutate,
    isLoading,
  } = useSWR<CustomProfileField, RequestError>(
    isEditing && `api/custom-profile-fields/${fieldName}`
  );

  const { getDefaultLabel, fromResponse, toRequestPayload } = useDataParser();

  const formMethods = useForm<ProfileFieldForm>({
    defaultValues: fromResponse({ name: fieldName ?? '' }),
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isSubmitted, isDirty },
  } = formMethods;

  const formValues = watch();
  const isCompositionType =
    formValues.type === CustomProfileFieldType.Address ||
    formValues.type === CustomProfileFieldType.Fullname;

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (data && !isLoading && !requestError) {
      reset(fromResponse(data));
    }
  }, [data, fromResponse, isLoading, requestError, reset]);

  /**
   * The `isDirty` flag is not immediately updated when the form values are submitted.
   * Instead, it is updated after the form is re-rendered. Therefore, we need to use
   * the `useEffect` to navigate to the parent route if the form is submitted and clean.
   */
  useEffect(() => {
    if (isCreating && isSubmitted && !isDirty) {
      navigate(parentPathname);
    }
  }, [isCreating, isSubmitted, isDirty, navigate]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }
      const payload = toRequestPayload(formData);

      const submitFunction = isCreating
        ? api.post('api/custom-profile-fields', { json: payload })
        : api.put(`api/custom-profile-fields/${fieldName}`, { json: payload });

      const result = await submitFunction.json<CustomProfileField>();
      reset(fromResponse(result));
      toast.success(t('general.saved'));
    })
  );

  const onDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      await api.delete(`api/custom-profile-fields/${fieldName}`);
      setIsDeleted(true);
      setIsDeleteFormOpen(false);
      toast.success(
        t('sign_in_exp.custom_profile_fields.details.field_deleted', { name: data?.name })
      );
      navigate(parentPathname);
    } finally {
      setIsDeleting(false);
    }
  }, [api, fieldName, t, data?.name, navigate]);

  if (!fieldName) {
    return null;
  }

  return (
    <DetailsPage
      backLink={parentPathname}
      backLinkTitle="sign_in_exp.custom_profile_fields.details.back_to_sie"
      isLoading={isLoading}
      error={requestError}
      onRetry={mutate}
    >
      <PageMeta titleKey="sign_in_exp.custom_profile_fields.details.page_title" />
      {(!!data || isCreating) && (
        <>
          <DetailsPageHeader
            title={formValues.label || getDefaultLabel(fieldName)}
            identifier={{
              name: t('sign_in_exp.custom_profile_fields.details.key'),
              tags: formValues.parts
                ?.filter(({ enabled }) => enabled)
                .map(({ name }) => (fieldName === 'address' ? `address.${name}` : name)) ?? [
                isBuiltInFieldName ? fieldName : `customData.${fieldName}`,
              ],
            }}
            actionMenuItems={cond(
              isEditing && [
                {
                  type: 'danger',
                  title: 'general.delete',
                  icon: <Delete />,
                  onClick: () => {
                    setIsDeleteFormOpen(true);
                  },
                },
              ]
            )}
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
            <FormProvider {...formMethods}>
              <DetailsForm
                isDirty={isDirty || isCreating}
                isSubmitting={isSubmitting}
                onDiscard={cond(isEditing && reset)}
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
                {formValues.parts?.map(
                  ({ name, label, enabled }, index) =>
                    enabled && (
                      <FormCard key={`parts.${name}`} title={<DangerousRaw>{label}</DangerousRaw>}>
                        <ProfileFieldPartSubForm index={index} />
                      </FormCard>
                    )
                )}
              </DetailsForm>
            </FormProvider>
            <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
          </TabWrapper>
        </>
      )}
    </DetailsPage>
  );
}

export default ProfileFieldDetails;
