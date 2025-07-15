import { type UserProfile, type CustomProfileField } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import { InputField } from '@/components/InputFields';
import { fullnameFieldConfigGuard } from '@/types/guard';

import styles from './index.module.scss';

type FullnameFormType = Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;

type Props = {
  readonly field: CustomProfileField;
};

const FullnameSubForm = ({ field }: Props) => {
  const { t } = useTranslation();
  const { required, description, config } = field;
  s.assert(config, fullnameFieldConfigGuard);

  const {
    control,
    formState: { errors },
  } = useFormContext<FullnameFormType>();

  const enabledParts = useMemo(() => config.parts.filter(({ enabled }) => enabled), [config]);

  return (
    <div
      className={classNames(
        styles.fullnameContainer,
        enabledParts.length % 2 === 1 && styles.vertical
      )}
    >
      {enabledParts.map(({ key }) => (
        <Controller
          key={key}
          name={key}
          control={control}
          rules={{ required }}
          render={({ field: { onChange, value } }) => (
            <InputField
              className={styles.inputField}
              label={t(`profile.${key}`)}
              value={value ?? ''}
              errorMessage={errors[key]?.message}
              onChange={onChange}
            />
          )}
        />
      ))}
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
};

export default FullnameSubForm;
