import { CustomProfileFieldType } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { type ReactNode } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

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
import TextLink from '@/ds-components/TextLink';
import Textarea from '@/ds-components/Textarea';

import { type ProfileFieldForm } from '../../CollectUserProfile/types';
import useI18nFieldLabel from '../../CollectUserProfile/use-i18n-field-label';
import {
  isBuiltInAddressComponentKey,
  isBuiltInCustomProfileFieldKey,
} from '../../CollectUserProfile/utils';
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

  const getI18nLabel = useI18nFieldLabel();

  const name = watch(`${fieldPrefix}name`);
  const type = watch(`${fieldPrefix}type`);
  const isBuiltInAddressComponent = isBuiltInAddressComponentKey(name);
  const isBuiltInFieldName = isBuiltInCustomProfileFieldKey(name) || isBuiltInAddressComponent;
  const formErrors = index === undefined ? errors : errors.parts?.[index];

  return (
    <>
      <FormField title="sign_in_exp.custom_profile_fields.details.key">
        <Controller
          name={`${fieldPrefix}name`}
          control={control}
          render={({ field: { value } }) => {
            const InputComponent = isBuiltInFieldName ? TextInput : CustomDataProfileNameField;
            return (
              <InputComponent
                disabled
                value={isBuiltInAddressComponent ? `address.${value}` : value}
              />
            );
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
      {type === CustomProfileFieldType.Date && (
        <FormField title="sign_in_exp.custom_profile_fields.details.date_format">
          <DateFormatSelector />
        </FormField>
      )}
      <FormField
        isRequired={!isBuiltInFieldName}
        title="sign_in_exp.custom_profile_fields.details.label"
        tip={t('sign_in_exp.custom_profile_fields.details.label_tooltip')}
      >
        <Controller
          name={`${fieldPrefix}label`}
          control={control}
          rules={{
            required:
              !isBuiltInFieldName &&
              t('errors.required_field_missing', {
                field: t('sign_in_exp.custom_profile_fields.details.label').toLowerCase(),
              }),
          }}
          render={({ field: { value, onChange } }) => {
            const fallbackValue = isBuiltInFieldName ? getI18nLabel(name) : '';
            return (
              <TextInput
                disabled={isBuiltInFieldName}
                error={formErrors?.label?.message}
                placeholder={t('sign_in_exp.custom_profile_fields.details.label_placeholder')}
                value={value || fallbackValue}
                description={cond(
                  isBuiltInFieldName && (
                    <Trans components={{ a: <TextLink to="/sign-in-experience/content" /> }}>
                      {t('sign_in_exp.custom_profile_fields.details.label_tip')}
                    </Trans>
                  )
                )}
                onChange={onChange}
              />
            );
          }}
        />
      </FormField>
      {type !== CustomProfileFieldType.Checkbox && (
        <FormField
          title="sign_in_exp.custom_profile_fields.details.placeholder"
          tip={t('sign_in_exp.custom_profile_fields.details.placeholder_tooltip')}
        >
          <TextInput
            {...register(`${fieldPrefix}placeholder`)}
            error={formErrors?.placeholder?.message}
            placeholder={t('sign_in_exp.custom_profile_fields.details.placeholder_placeholder')}
          />
        </FormField>
      )}
      {type !== CustomProfileFieldType.Checkbox && (
        <FormField
          title="sign_in_exp.custom_profile_fields.details.description"
          tip={t('sign_in_exp.custom_profile_fields.details.description_tooltip')}
        >
          <TextInput
            {...register(`${fieldPrefix}description`)}
            error={formErrors?.description?.message}
            placeholder={t('sign_in_exp.custom_profile_fields.details.description_placeholder')}
          />
        </FormField>
      )}
      {type === CustomProfileFieldType.Select && (
        <FormField isRequired title="sign_in_exp.custom_profile_fields.details.options">
          <Textarea
            {...register(`${fieldPrefix}options`, {
              required: t('errors.required_field_missing', {
                field: t('sign_in_exp.custom_profile_fields.details.options').toLowerCase(),
              }),
            })}
            error={formErrors?.options?.message}
            description={t('sign_in_exp.custom_profile_fields.details.options_tip')}
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
                field: t('sign_in_exp.custom_profile_fields.details.regex').toLowerCase(),
              }),
            })}
            error={formErrors?.format?.message}
            placeholder={t('sign_in_exp.custom_profile_fields.details.regex_placeholder')}
            description={t('sign_in_exp.custom_profile_fields.details.regex_tip')}
          />
        </FormField>
      )}
      {type === CustomProfileFieldType.Checkbox && (
        <FormField title="sign_in_exp.custom_profile_fields.details.default_value">
          <Controller
            name={`${fieldPrefix}defaultValue`}
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Select
                  value={value === 'true' ? 'true' : 'false'}
                  options={[
                    {
                      value: 'true',
                      title: t('sign_in_exp.custom_profile_fields.details.checkbox_checked'),
                    },
                    {
                      value: 'false',
                      title: t('sign_in_exp.custom_profile_fields.details.checkbox_unchecked'),
                    },
                  ]}
                  onChange={onChange}
                />
              );
            }}
          />
        </FormField>
      )}
      {type !== CustomProfileFieldType.Checkbox && (
        <FormField title="sign_in_exp.custom_profile_fields.details.required">
          <Switch
            label={t('sign_in_exp.custom_profile_fields.details.required_description')}
            {...register(`${fieldPrefix}required`)}
          />
        </FormField>
      )}
    </>
  );
}

export default ProfileFieldPartSubForm;
