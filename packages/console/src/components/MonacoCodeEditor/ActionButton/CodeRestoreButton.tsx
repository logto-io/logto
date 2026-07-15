import classNames from 'classnames';

import RedoIcon from '@/assets/icons/redo.svg?react';

import ActionButton from './index';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly actionTip: string;
  readonly actionSuccessTip: string;
  readonly onClick: () => void;
};

function CodeRestoreButton({ className, actionTip, actionSuccessTip, onClick }: Props) {
  return (
    <ActionButton
      className={classNames(className, styles.actionButton)}
      actionTip={actionTip}
      actionSuccessTip={actionSuccessTip}
      icon={<RedoIcon />}
      onClick={onClick}
    />
  );
}

export default CodeRestoreButton;
