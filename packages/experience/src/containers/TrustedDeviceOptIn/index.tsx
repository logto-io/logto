import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CheckboxField from '@/components/InputFields/CheckboxField';
import { type TrustedDeviceAvailability } from '@/types/guard';

import styles from './index.module.scss';

type Props = {
  readonly availability?: TrustedDeviceAvailability;
  readonly isLoading: boolean;
  readonly isChecked: boolean;
  readonly className?: string;
  readonly onChange: (checked: boolean) => void;
};

const TrustedDeviceOptIn = ({ availability, isLoading, isChecked, className, onChange }: Props) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <div aria-hidden className={classNames(styles.placeholder, className)} />;
  }

  if (!availability?.canCreate || !availability.durationDays) {
    return null;
  }

  const { durationDays } = availability;

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
