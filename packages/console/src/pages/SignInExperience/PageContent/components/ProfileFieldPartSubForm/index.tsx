import { CustomProfileFieldType } from '@logto/schemas';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';

import { type ProfileFieldForm } from '../../CollectUserProfile/ProfileFieldDetails/types';
import { isBuiltInCustomProfileFieldKey } from '../../CollectUserProfile/utils';
import CustomDataProfileNameField from '../CustomDataProfileNameField';
import DateFormatSelector from '../DateFormatSelector';
import RangedNumberInputs from '../RangedNumberInputs';

type Props = {
  readonly index?: number;
};

function ProfileFieldPartSubForm({ index }: Props) {
  const fieldPrefix = index === undefined ? '' : (`parts.${index}.` as const);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProfileFieldForm>();

  const name = watch(`${fieldPrefix}name`);
  const type = watch(`${fieldPrefix}type`);
  const isBuiltInFieldName = isBuiltInCustomProfileFieldKey(name);
  const formErrors = index === undefined ? errors : errors.parts?.[index];

  return (
    <>
      <FormField isRequired title="sign_in_exp.custom_profile_fields.details.key">
        <Controller
          name={`${fieldPrefix}name`}
          control={control}
          render={({ field: { onChange, value } }) => {
            const InputComponent = isBuiltInFieldName ? TextInput : CustomDataProfileNameField;
            return <InputComponent disabled value={value} onChange={onChange} />;
          }}
        />
      </FormField>
      <FormField isRequired title="sign_in_exp.custom_profile_fields.details.field_type">
        <Controller
          name={`${fieldPrefix}type`}
          control={control}
          render={({ field: { onChange, value } }) => {
            const options = Object.values(CustomProfileFieldType)
              .filter(
                (type) =>
                  !fieldPrefix ||
                  (type !== CustomProfileFieldType.Address &&
                    type !== CustomProfileFieldType.Fullname)
              )
              .map((type) => ({
                value: type,
                title: t(`sign_in_exp.custom_profile_fields.type.${type}`),
              }));
            return <Select options={options} value={value} onChange={onChange} />;
          }}
        />
      </FormField>
      <FormField isRequired title="sign_in_exp.custom_profile_fields.details.label">
        <TextInput
          {...register(`${fieldPrefix}label`, { required: true })}
          error={formErrors?.label?.message}
          placeholder={t('sign_in_exp.custom_profile_fields.details.label_placeholder')}
        />
      </FormField>
      <FormField title="sign_in_exp.custom_profile_fields.details.description">
        <TextInput
          {...register(`${fieldPrefix}description`)}
          error={formErrors?.description?.message}
          placeholder={t('sign_in_exp.custom_profile_fields.details.description_placeholder')}
        />
      </FormField>
      {(type === CustomProfileFieldType.Checkbox || type === CustomProfileFieldType.Select) && (
        <FormField title="sign_in_exp.custom_profile_fields.details.options">
          <Textarea
            {...register(`${fieldPrefix}options`)}
            error={formErrors?.options?.message}
            placeholder={t('sign_in_exp.custom_profile_fields.details.options_placeholder')}
            rows={5}
          />
        </FormField>
      )}
      {type === CustomProfileFieldType.Text && (
        <FormField title="sign_in_exp.custom_profile_fields.details.input_length">
          <RangedNumberInputs minValueName="minLength" maxValueName="maxLength" index={index} />
        </FormField>
      )}
      {type === CustomProfileFieldType.Number && (
        <FormField title="sign_in_exp.custom_profile_fields.details.value_range">
          <RangedNumberInputs minValueName="minValue" maxValueName="maxValue" index={index} />
        </FormField>
      )}
      {type === CustomProfileFieldType.Regex && (
        <FormField title="sign_in_exp.custom_profile_fields.details.regex">
          <TextInput
            {...register(`${fieldPrefix}format`)}
            error={formErrors?.format?.message}
            placeholder={t('sign_in_exp.custom_profile_fields.details.regex_placeholder')}
            description={t('sign_in_exp.custom_profile_fields.details.regex_tip')}
          />
        </FormField>
      )}
      {type === CustomProfileFieldType.Date && (
        <FormField title="sign_in_exp.custom_profile_fields.details.date_format">
          <DateFormatSelector />
        </FormField>
      )}
      <FormField title="sign_in_exp.custom_profile_fields.details.required">
        <Switch
          label={t('sign_in_exp.custom_profile_fields.details.required_description')}
          {...register(`${fieldPrefix}required`)}
        />
      </FormField>
    </>
  );
}

export default ProfileFieldPartSubForm;
