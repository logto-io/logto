import classNames from 'classnames';
import type { TFuncKey } from 'i18next';

import DynamicT from '@/components/DynamicT';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly message: TFuncKey;
};

const InlineNotification = ({ className, message }: Props) => {
  return (
    <div className={classNames(styles.notification, className)}>
      <DynamicT forKey={message} />
    </div>
  );
};

export default InlineNotification;
