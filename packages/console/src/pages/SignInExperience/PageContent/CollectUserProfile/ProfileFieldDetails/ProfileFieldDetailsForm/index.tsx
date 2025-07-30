import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { collectUserProfile } from '@/consts';
import DangerousRaw from '@/ds-components/DangerousRaw';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import CompositionPartsSelector from '../../../components/CompositionPartsSelector';
import ProfileFieldPartSubForm from '../../../components/ProfileFieldPartSubForm';
import { useDataParser } from '../../hooks';
import { type ProfileFieldForm } from '../types';

type Props = {
  readonly data: CustomProfileField;
  readonly isDeleted?: boolean;
};

function ProfileFieldDetailsForm({ data, isDeleted }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { parseResponseToFormData, parseFormDataToRequestPayload } = useDataParser();
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
      toast.success(t('general.saved'));
    })
  );

  return (
    <>
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
                <FormCard key={`parts.${name}`} title={<DangerousRaw>{label}</DangerousRaw>}>
                  <ProfileFieldPartSubForm index={index} />
                </FormCard>
              )
          )}
        </DetailsForm>
      </FormProvider>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
    </>
  );
}

export default ProfileFieldDetailsForm;
