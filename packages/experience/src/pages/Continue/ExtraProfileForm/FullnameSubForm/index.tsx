import { type UserProfile, type CustomProfileField } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import PrimitiveProfileInputField from '@/components/InputFields/PrimitiveProfileInputField';
import { fullnameFieldConfigGuard } from '@/types/guard';

import useFieldLabel from '../use-field-label';
import useValidateField from '../use-validate-field';

import styles from './index.module.scss';

type FullnameFormType = Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;

type Props = {
  readonly field: CustomProfileField;
};

const FullnameSubForm = ({ field }: Props) => {
  const { t } = useTranslation();
  const getFieldLabel = useFieldLabel();
  const validateField = useValidateField();

  const { name, label, description, config } = field;
  s.assert(config, fullnameFieldConfigGuard);

  const {
    control,
    formState: { errors },
  } = useFormContext<FullnameFormType>();

  const enabledParts = useMemo(() => config.parts.filter(({ enabled }) => enabled), [config.parts]);
  const fullnameErrors = Object.entries(errors).filter(([errorKey]) =>
    enabledParts.some(({ name }) => name === errorKey)
  );
  const hasNonRequiredErrors = fullnameErrors.some(([_, error]) => error.type !== 'required');

  return (
    <div className={styles.fullnameContainer}>
      <div
        className={classNames(styles.flexWrapper, enabledParts.length % 2 === 1 && styles.vertical)}
      >
        {enabledParts.map((part) => (
          <Controller
            key={part.name}
            name={part.name}
            control={control}
            rules={{
              required:
                part.required &&
                t('error.general_required', { types: [getFieldLabel(part.name, part.label)] }),
              validate: (value) => validateField(value, part),
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <PrimitiveProfileInputField
                {...part}
                className={styles.inputField}
                name={part.name}
                label={part.label ?? t(`profile.${part.name}`)}
                value={value ?? ''}
                isDanger={!!errors[part.name]}
                required={part.required}
                onBlur={onBlur}
                onChange={onChange}
              />
            )}
          />
        ))}
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {fullnameErrors.length > 0 && (
        <div className={styles.errorMessage}>
          {hasNonRequiredErrors ? (
            <>
              {fullnameErrors.map(([errorKey, error]) => (
                <p key={errorKey}>{error.message}</p>
              ))}
            </>
          ) : (
            <p>{t('error.general_required', { types: [getFieldLabel(name, label)] })}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FullnameSubForm;
