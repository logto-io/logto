import { CustomProfileFieldType } from '@logto/schemas';
import { type ReactNode } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CheckboxIcon from '@/assets/icons/field-type-checkbox.svg?react';
import DateIcon from '@/assets/icons/field-type-date.svg?react';
import DropdownIcon from '@/assets/icons/field-type-dropdown.svg?react';
import NumberIcon from '@/assets/icons/field-type-number.svg?react';
import RegexIcon from '@/assets/icons/field-type-regex.svg?react';
import TextIcon from '@/assets/icons/field-type-text.svg?react';
import UrlIcon from '@/assets/icons/field-type-url.svg?react';
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

import styles from './index.module.scss';

const fieldTypeIconMappings: Record<string, ReactNode> = Object.freeze({
  [CustomProfileFieldType.Date]: <DateIcon />,
  [CustomProfileFieldType.Select]: <DropdownIcon />,
  [CustomProfileFieldType.Number]: <NumberIcon />,
  [CustomProfileFieldType.Text]: <TextIcon />,
  [CustomProfileFieldType.Url]: <UrlIcon />,
  [CustomProfileFieldType.Regex]: <RegexIcon />,
  [CustomProfileFieldType.Checkbox]: <CheckboxIcon />,
});

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
      <FormField title="sign_in_exp.custom_profile_fields.details.key">
        <Controller
          name={`${fieldPrefix}name`}
          control={control}
          render={({ field: { onChange, value } }) => {
            const InputComponent = isBuiltInFieldName ? TextInput : CustomDataProfileNameField;
            return <InputComponent disabled value={value} onChange={onChange} />;
          }}
        />
      </FormField>
      <FormField title="sign_in_exp.custom_profile_fields.details.field_type">
        <Controller
          name={`${fieldPrefix}type`}
          control={control}
          render={({ field: { onChange, value } }) => {
            const options = Object.values(CustomProfileFieldType)
              .filter(
                (type) =>
                  type !== CustomProfileFieldType.Address &&
                  type !== CustomProfileFieldType.Fullname
              )
              .map((type) => ({
                value: type,
                title: (
                  <div className={styles.dropdownTitleWrapper}>
                    {fieldTypeIconMappings[type]}
                    {t(`sign_in_exp.custom_profile_fields.type.${type}`)}
                  </div>
                ),
              }));
            return <Select options={options} value={value} onChange={onChange} />;
          }}
        />
      </FormField>
      <FormField isRequired title="sign_in_exp.custom_profile_fields.details.label">
        <TextInput
          {...register(`${fieldPrefix}label`, {
            required: t('errors.required_field_missing', {
              field: t('sign_in_exp.custom_profile_fields.details.label'),
            }),
          })}
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
        <FormField isRequired title="sign_in_exp.custom_profile_fields.details.options">
          <Textarea
            {...register(`${fieldPrefix}options`, {
              required: t('errors.required_field_missing', {
                field: t('sign_in_exp.custom_profile_fields.details.options'),
              }),
            })}
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
        <FormField isRequired title="sign_in_exp.custom_profile_fields.details.regex">
          <TextInput
            {...register(`${fieldPrefix}format`, {
              required: t('errors.required_field_missing', {
                field: t('sign_in_exp.custom_profile_fields.details.regex'),
              }),
            })}
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
