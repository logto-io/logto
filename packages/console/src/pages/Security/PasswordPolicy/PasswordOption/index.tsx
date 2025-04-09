import { type ReactNode } from 'react';
import { Controller, type FieldPath, useFormContext } from 'react-hook-form';

import Checkbox from '@/ds-components/Checkbox';

import { type PasswordPolicyFormData } from '../use-password-policy';

import styles from './index.module.scss';

type PasswordOptionProps = {
  readonly name: FieldPath<PasswordPolicyFormData>;
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
};

/** A display component for password policy options with a title and description. */
function PasswordOption({ name, title, description, children }: PasswordOptionProps) {
  const { control } = useFormContext<PasswordPolicyFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Checkbox
          className={styles.passwordOption}
          label={
            <div className={styles.label}>
              <div className={styles.title}>{title}</div>
              <div className={styles.description}>{description}</div>
              {children}
            </div>
          }
          checked={Boolean(value)}
          onChange={onChange}
        />
      )}
    />
  );
}

export default PasswordOption;
