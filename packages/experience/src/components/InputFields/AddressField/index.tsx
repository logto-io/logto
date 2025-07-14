import type { AddressProfileField, UserProfile } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import InputField from '../InputField';

import styles from './index.module.scss';
import { formatAddress } from './utils';

type Props = {
  readonly value?: UserProfile['address'];
  readonly parts?: AddressProfileField['config']['parts'];
  readonly description?: string;
  readonly onChange: (value: UserProfile['address']) => void;
};

const AddressField = ({ value, parts, description, onChange }: Props) => {
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
          value={value?.[key]}
          onChange={(event) => {
            const newValue = { ...value, [key]: event.currentTarget.value };
            onChange(key === 'formatted' ? newValue : formatAddress(newValue));
          }}
        />
      ))}
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
};

export default AddressField;
