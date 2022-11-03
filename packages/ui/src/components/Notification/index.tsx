import classNames from 'classnames';

import InfoIcon from '@/assets/icons/info-icon.svg';

import TextLink from '../TextLink';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  message: string;
  onClose: () => void;
  type?: 'info' | 'alert';
};

const Notification = ({ className, message, onClose, type = 'info' }: Props) => {
  return (
    <div className={classNames(styles.notification, styles[type], className)}>
      <InfoIcon className={styles.icon} />
      <div className={styles.message}>{message}</div>
      <TextLink text="action.got_it" className={styles.link} onClick={onClose} />
    </div>
  );
};

export default Notification;
