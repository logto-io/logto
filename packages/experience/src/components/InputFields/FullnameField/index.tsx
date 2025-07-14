import { type FullnameProfileField, type UserProfile } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import InputField from '../InputField';

import styles from './index.module.scss';

type Fullname = Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;

type Props = {
  readonly value?: Fullname;
  readonly parts?: FullnameProfileField['config']['parts'];
  readonly onChange: (value: Fullname) => void;
};

const FullnameField = ({ value, parts, onChange }: Props) => {
  const { t } = useTranslation();
  const enabledParts = useMemo(() => parts?.filter(({ enabled }) => enabled), [parts]);

  return (
    <div
      className={classNames(
        styles.fullnameContainer,
        enabledParts?.length !== 2 && styles.vertical
      )}
    >
      {enabledParts?.map(({ key }) => (
        <InputField
          key={key}
          className={styles.inputField}
          label={t(`profile.${key}`)}
          value={value?.[key]}
          onChange={(event) => {
            onChange({ ...value, [key]: event.currentTarget.value });
          }}
        />
      ))}
    </div>
  );
};

export default FullnameField;
