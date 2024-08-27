import classNames from 'classnames';

import transferLayout from '@/scss/transfer.module.scss';
import { type Identifiable } from '@/types/general';

import SourceEntitiesBox, { type Props as SourceProps } from './components/SourceEntitiesBox';
import TargetEntitiesBox from './components/TargetEntitiesBox';
import styles from './index.module.scss';

type Props<T extends Identifiable> = SourceProps<T> & {
  readonly errorMessage?: string;
};

function EntitiesTransfer<T extends Identifiable>({ errorMessage, ...props }: Props<T>) {
  return (
    <>
      <div className={classNames(transferLayout.container, styles.rolesTransfer)}>
        <SourceEntitiesBox {...props} />
        <div className={transferLayout.verticalBar} />
        <TargetEntitiesBox {...props} />
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </>
  );
}

export default EntitiesTransfer;
