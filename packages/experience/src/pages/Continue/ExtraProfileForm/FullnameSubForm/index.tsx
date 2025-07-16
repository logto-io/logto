import { type UserProfile, type CustomProfileField } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import { InputField } from '@/components/InputFields';
import { fullnameFieldConfigGuard } from '@/types/guard';

import useFieldLabel from '../use-field-label';

import styles from './index.module.scss';

type FullnameFormType = Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;

type Props = {
  readonly field: CustomProfileField;
};

const FullnameSubForm = ({ field }: Props) => {
  const { t } = useTranslation();
  const getFieldLabel = useFieldLabel();
  const { required, name, label, description, config } = field;
  s.assert(config, fullnameFieldConfigGuard);

  const {
    control,
    formState: { errors },
  } = useFormContext<FullnameFormType>();

  const enabledParts = useMemo(() => config.parts.filter(({ enabled }) => enabled), [config.parts]);
  const hasFullnameError = Object.entries(errors).some(([errorKey]) =>
    enabledParts.some(({ key }) => key === errorKey)
  );

  return (
    <div className={styles.fullnameContainer}>
      <div
        className={classNames(styles.flexWrapper, enabledParts.length % 2 === 1 && styles.vertical)}
      >
        {enabledParts.map(({ key }) => (
          <Controller
            key={key}
            name={key}
            control={control}
            rules={{ required }}
            render={({ field: { onBlur, onChange, value } }) => (
              <InputField
                className={styles.inputField}
                label={t(`profile.${key}`)}
                value={value ?? ''}
                isDanger={hasFullnameError}
                onBlur={onBlur}
                onChange={onChange}
              />
            )}
          />
        ))}
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {hasFullnameError && (
        <div className={styles.errorMessage}>
          {t('error.general_required', { types: [getFieldLabel(name, label)] })}
        </div>
      )}
    </div>
  );
};

export default FullnameSubForm;
