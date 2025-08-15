import { SupportedDateFormat } from '@logto/schemas';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { dateFnsDocumentationLink } from '@/consts';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';

import { type ProfileFieldForm } from '../../CollectUserProfile/types';

import styles from './index.module.scss';

type Props = {
  readonly index?: number;
};

function DateFormatSelector({ index }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProfileFieldForm>();

  const fieldPrefix = index === undefined ? '' : (`parts.${index}.` as const);
  const formatValue = watch(`${fieldPrefix}format`);
  const formErrors = index === undefined ? errors : errors.parts?.[index];

  useEffect(() => {
    if (!formatValue) {
      setValue(`${fieldPrefix}format`, SupportedDateFormat.US, { shouldDirty: true });
      setValue(`${fieldPrefix}placeholder`, SupportedDateFormat.US, { shouldDirty: true });
    }
  }, [fieldPrefix, formatValue, setValue]);

  useEffect(() => {
    return () => {
      setValue(`${fieldPrefix}format`, '');
      setValue(`${fieldPrefix}placeholder`, '');
      setValue(`${fieldPrefix}customFormat`, '');
    };
  }, [fieldPrefix, setValue]);

  return (
    <div className={styles.dateFormatSelector}>
      <Controller
        name={`${fieldPrefix}format`}
        control={control}
        render={({ field: { value, onChange } }) => (
          <Select
            options={[
              {
                value: SupportedDateFormat.US,
                title: t('sign_in_exp.custom_profile_fields.details.date_format_us'),
              },
              {
                value: SupportedDateFormat.UK,
                title: t('sign_in_exp.custom_profile_fields.details.date_format_uk'),
              },
              {
                value: SupportedDateFormat.ISO,
                title: t('sign_in_exp.custom_profile_fields.details.date_format_iso'),
              },
              {
                value: SupportedDateFormat.Custom,
                title: t('sign_in_exp.custom_profile_fields.details.custom_date_format'),
              },
            ]}
            value={value}
            onChange={(value) => {
              onChange(value);
              setValue(
                `${fieldPrefix}placeholder`,
                value === SupportedDateFormat.Custom ? '' : value,
                { shouldDirty: true }
              );
            }}
          />
        )}
      />
      {formatValue === SupportedDateFormat.Custom && (
        <FormField isRequired title="sign_in_exp.custom_profile_fields.details.custom_date_format">
          <TextInput
            {...register(`${fieldPrefix}customFormat`, { required: true })}
            error={
              formErrors?.customFormat &&
              t('errors.required_field_missing', {
                field: t(
                  'sign_in_exp.custom_profile_fields.details.custom_date_format'
                ).toLowerCase(),
              })
            }
            placeholder={t(
              'sign_in_exp.custom_profile_fields.details.custom_date_format_placeholder'
            )}
            description={
              <Trans
                components={{
                  a: <TextLink targetBlank href={dateFnsDocumentationLink} />,
                }}
              >
                {t('sign_in_exp.custom_profile_fields.details.custom_date_format_tip')}
              </Trans>
            }
          />
        </FormField>
      )}
    </div>
  );
}

export default DateFormatSelector;
