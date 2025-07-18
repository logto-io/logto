import type { CustomProfileField, UserProfile } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import { InputField } from '@/components/InputFields';
import { addressFieldConfigGuard } from '@/types/guard';

import styles from './index.module.scss';

type AddressSubFormType = Pick<UserProfile, 'address'>;

type Props = {
  readonly field: CustomProfileField;
};

/**
 * The address data structure in profile is as follows:
 *
 * ```
 * address: {
 *   streetAddress?: string;
 *   locality?: string;
 *   region?: string;
 *   postalCode?: string;
 *   country?: string;
 *   formatted?: string;
 * }
 * ```
 *
 * The `formatted` field can be configured in the `config.parts` and rendered as an input,
 * or be computed from the other fields and stay invisible if not specified.
 */
const AddressSubForm = ({ field }: Props) => {
  const { t } = useTranslation();
  const {
    control,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<AddressSubFormType>();

  const { description, config, required } = field;

  const enabledParts = useMemo(() => {
    s.assert(config, addressFieldConfigGuard);
    return config.parts.filter(({ enabled }) => enabled);
  }, [config]);

  const values = watch('address');

  const setFormattedValue = useCallback(() => {
    const formatted = enabledParts
      .map(({ key }) => values?.[key])
      .filter(Boolean)
      .join(', ');
    setValue('address.formatted', formatted);
  }, [enabledParts, setValue, values]);

  if (enabledParts.length === 0) {
    return null;
  }

  return (
    <div className={styles.addressContainer}>
      {enabledParts.map(({ key }) => (
        <Controller
          key={key}
          name={`address.${key}`}
          control={control}
          rules={{ required }}
          render={({ field: { onBlur, onChange, value } }) => (
            <InputField
              key={key}
              className={classNames(
                styles.inputField,
                (key === 'locality' || key === 'region') && styles.halfSize
              )}
              label={t(`profile.address.${key}`)}
              value={value ?? ''}
              isDanger={!!errors.address?.[key]}
              onBlur={onBlur}
              onChange={(event) => {
                onChange(event);
                if (key !== 'formatted') {
                  setFormattedValue();
                }
              }}
            />
          )}
        />
      ))}
      {!enabledParts.some(({ key }) => key === 'formatted') && (
        <input {...register('address.formatted')} hidden />
      )}
      {description && <div className={styles.description}>{description}</div>}
      {errors.address && (
        <div className={styles.errorMessage}>
          {t('error.general_required', { types: [t('profile.address.formatted')] })}
        </div>
      )}
    </div>
  );
};

export default AddressSubForm;
