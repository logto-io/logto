import classNames from 'classnames';

import { isAppleConnector } from '@/utils/social-connectors';

import * as styles from './SocialIconButton.module.scss';

type Props = {
  className?: string;
  logo: string;
  target?: string;
  onClick?: () => void;
};

const SocialIconButton = ({ className, logo, target, onClick }: Props) => (
  <button
    className={classNames(
      styles.socialButton,
      isAppleConnector(target) && styles.inverse,
      className
    )}
    onClick={onClick}
  >
    {logo && <img src={logo} alt={target} className={styles.icon} />}
  </button>
);

export default SocialIconButton;
