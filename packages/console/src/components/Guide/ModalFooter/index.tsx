import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';

type Props = {
  readonly wrapperClassName?: string;
  readonly content: AdminConsoleKey;
  readonly buttonText: AdminConsoleKey;
  readonly onClick: () => void;
};

export default function ModalFooter({ wrapperClassName, content, buttonText, onClick }: Props) {
  return (
    <nav className={styles.actionBar}>
      <div className={classNames(styles.wrapper, wrapperClassName)}>
        <span className={styles.text}>
          <DynamicT forKey={content} />
        </span>
        <Button size="large" title={buttonText} type="outline" onClick={onClick} />
      </div>
    </nav>
  );
}
