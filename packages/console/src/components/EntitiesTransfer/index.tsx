import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';
import { type Identifiable } from '@/types/general';

import SourceEntitiesBox, { type Props as SourceProps } from './components/SourceEntitiesBox';
import TargetEntitiesBox from './components/TargetEntitiesBox';
import * as styles from './index.module.scss';

function EntitiesTransfer<T extends Identifiable>(props: SourceProps<T>) {
  return (
    <div className={classNames(transferLayout.container, styles.rolesTransfer)}>
      <SourceEntitiesBox {...props} />
      <div className={transferLayout.verticalBar} />
      <TargetEntitiesBox {...props} />
    </div>
  );
}

export default EntitiesTransfer;
