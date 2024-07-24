import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

type Props = {
  readonly isChecked?: boolean;
  readonly onChange: (checked: boolean) => void;
};

const TogglePassword = ({ isChecked, onChange }: Props) => {
  const { t } = useTranslation();

  const toggle = () => {
    onChange(!isChecked);
  };

  return (
    <div
      role="radio"
      aria-checked={isChecked}
      tabIndex={0}
      className={styles.passwordSwitch}
      onClick={toggle}
      onKeyDown={onKeyDownHandler({
        Escape: () => {
          onChange(false);
        },
        Enter: toggle,
        ' ': toggle,
      })}
    >
      <Checkbox name="toggle-password" checked={isChecked} className={styles.checkbox} />
      <div>{t('action.show_password')}</div>
    </div>
  );
};

export default TogglePassword;
