import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import NumericInput from '@/ds-components/TextInput/NumericInput';

import { type ProfileFieldForm } from '../../CollectUserProfile/types';

import styles from './index.module.scss';

type Props =
  | { minValueName: 'minValue'; maxValueName: 'maxValue'; index?: number }
  | { minValueName: 'minLength'; maxValueName: 'maxLength'; index?: number };

const onValueUp = (currentValue: string | undefined, onChange: (value: string) => void) => {
  const currentNumber = Number(currentValue);
  if (Number.isNaN(currentNumber)) {
    onChange('0');
    return;
  }
  onChange(String(currentNumber + 1));
};

const onValueDown = (currentValue: string | undefined, onChange: (value: string) => void) => {
  const currentNumber = Number(currentValue);
  if (Number.isNaN(currentNumber)) {
    onChange('0');
    return;
  }
  onChange(String(currentNumber - 1));
};

function RangedNumberInputs({ minValueName, maxValueName, index }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: errorT } = useTranslation('errors');
  const {
    formState: { errors },
    control,
    clearErrors,
    watch,
  } = useFormContext<ProfileFieldForm>();

  const fieldPrefix = index === undefined ? '' : (`parts.${index}.` as const);
  const minValueFieldName = `${fieldPrefix}${minValueName}` as const;
  const maxValueFieldName = `${fieldPrefix}${maxValueName}` as const;
  const formErrors = index === undefined ? errors : errors.parts?.[index];

  const minValue = watch(minValueFieldName);
  const maxValue = watch(maxValueFieldName);

  const rangedNumberError = formErrors?.[minValueName] ?? formErrors?.[maxValueName];

  return (
    <div className={styles.container}>
      <div className={styles.rangedNumberInput}>
        <Controller
          name={`${fieldPrefix}${minValueName}`}
          control={control}
          rules={{
            validate: (value) => {
              if (value && maxValue && Number(value) > Number(maxValue)) {
                return errorT('custom_profile_fields.invalid_min_max_input');
              }
              return true;
            },
          }}
          render={({ field: { onBlur, onChange, value } }) => (
            <div className={styles.inputWrapper}>
              <div className={styles.prefix}>
                {t('sign_in_exp.custom_profile_fields.details.min')}
              </div>
              <NumericInput
                className={styles.input}
                inputContainerClassName={styles.inputContainer}
                value={value ?? ''}
                min={0}
                error={!!formErrors?.[minValueName]}
                onBlur={() => {
                  clearErrors(maxValueFieldName);
                  onBlur();
                }}
                onChange={(event) => {
                  onChange(event.currentTarget.value);
                }}
                onValueUp={() => {
                  onValueUp(value, onChange);
                }}
                onValueDown={() => {
                  onValueDown(value, onChange);
                }}
              />
            </div>
          )}
        />
        <div className={styles.separator} />
        <Controller
          name={`${fieldPrefix}${maxValueName}`}
          control={control}
          rules={{
            validate: (value) => {
              if (value && minValue && Number(value) < Number(minValue)) {
                return errorT('custom_profile_fields.invalid_min_max_input');
              }
              return true;
            },
          }}
          render={({ field: { onBlur, onChange, value } }) => (
            <div className={styles.inputWrapper}>
              <div className={styles.prefix}>
                {t('sign_in_exp.custom_profile_fields.details.max')}
              </div>
              <NumericInput
                className={styles.input}
                inputContainerClassName={styles.inputContainer}
                value={value ?? ''}
                min={0}
                error={!!formErrors?.[maxValueName]}
                onBlur={() => {
                  clearErrors(minValueFieldName);
                  onBlur();
                }}
                onChange={(event) => {
                  onChange(event.currentTarget.value);
                }}
                onValueUp={() => {
                  onValueUp(value, onChange);
                }}
                onValueDown={() => {
                  onValueDown(value, onChange);
                }}
              />
            </div>
          )}
        />
      </div>
      {rangedNumberError?.message && (
        <div className={styles.errorMessage}>{rangedNumberError.message}</div>
      )}
    </div>
  );
}

export default RangedNumberInputs;
