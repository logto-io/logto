import classNames from 'classnames';

import Tick from '@/assets/images/tick.svg';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  index: number;
  isActive?: boolean;
  isComplete?: boolean;
};

function Index({ className, index, isActive, isComplete }: Props) {
  return (
    <div
      className={classNames(
        styles.container,
        className,
        isActive && styles.active,
        isComplete && styles.completed
      )}
    >
      {isComplete ? <Tick /> : index}
    </div>
  );
}

export default Index;
