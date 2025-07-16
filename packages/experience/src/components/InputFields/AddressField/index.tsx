import type { AddressProfileField, UserProfile } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import InputField from '../InputField';

import styles from './index.module.scss';
import { formatAddress } from './utils';

type Props = {
  readonly value?: UserProfile['address'];
  readonly parts?: AddressProfileField['config']['parts'];
  readonly description?: Nullable<string>;
  readonly errorMessage?: string;
  readonly onChange: (value: UserProfile['address']) => void;
};

const AddressField = ({ value, parts, description, errorMessage, onChange }: Props) => {
  const { t } = useTranslation();
  const enabledParts = useMemo(() => parts?.filter(({ enabled }) => enabled), [parts]);

  return (
    <div className={styles.addressGroup}>
      {enabledParts?.map(({ key }) => (
        <InputField
          key={key}
          className={classNames(
            styles.inputField,
            (key === 'locality' || key === 'region') && styles.halfSize
          )}
          label={t(`profile.address.${key}`)}
          value={value?.[key] ?? ''}
          isDanger={!!errorMessage}
          onChange={(event) => {
            const newValue = { ...value, [key]: event.currentTarget.value };
            onChange(key === 'formatted' ? newValue : formatAddress(newValue));
          }}
        />
      ))}
      {description && <div className={styles.description}>{description}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

export default AddressField;
