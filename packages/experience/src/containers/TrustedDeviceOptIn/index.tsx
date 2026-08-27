import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CheckboxField from '@/components/InputFields/CheckboxField';

import styles from './index.module.scss';

type Props = {
  readonly durationDays?: number;
  readonly isChecked: boolean;
  readonly className?: string;
  readonly onChange: (checked: boolean) => void;
};

const TrustedDeviceOptIn = ({ durationDays, isChecked, className, onChange }: Props) => {
  const { t } = useTranslation();

  if (!durationDays) {
    return null;
  }

  return (
    <CheckboxField
      name="createTrustedDevice"
      checked={isChecked}
      title={t('mfa.trust_this_device', { count: durationDays })}
      className={classNames(styles.optIn, className)}
      onChange={onChange}
    />
  );
};

export default TrustedDeviceOptIn;
