import { type AdminConsoleKey } from '@logto/phrases';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  content: AdminConsoleKey;
  buttonText: AdminConsoleKey;
  onClick: () => void;
};

export default function ModalFooter({ content, buttonText, onClick }: Props) {
  return (
    <nav className={styles.actionBar}>
      <div className={styles.wrapper}>
        <span className={styles.text}>
          <DynamicT forKey={content} />
        </span>
        <Button size="large" title={buttonText} type="outline" onClick={onClick} />
      </div>
    </nav>
  );
}
