import SwitchIcon from '@experience/shared/assets/icons/switch-icon.svg?react';
import DynamicT from '@experience/shared/components/DynamicT';
import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly onClick?: () => void;
  readonly className?: string;
};

const SwitchVerificationMethodLink = ({ onClick, className }: Props) => {
  return (
    <button
      type="button"
      className={classNames(styles.link, className)}
      onClick={() => {
        onClick?.();
      }}
    >
      <SwitchIcon />
      <DynamicT forKey="account_center.verification.try_another_method" />
    </button>
  );
};

export default SwitchVerificationMethodLink;
