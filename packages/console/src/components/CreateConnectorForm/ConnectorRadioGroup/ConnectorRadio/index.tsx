import { type ConnectorFactoryResponse } from '@logto/schemas';
import classNames from 'classnames';

import ConnectorLogo from '@/components/ConnectorLogo';
import UnnamedTrans from '@/components/UnnamedTrans';
import { type ConnectorGroup } from '@/types/connector';

import * as styles from './index.module.scss';

type Props = {
  readonly data: ConnectorGroup<ConnectorFactoryResponse>;
};

function ConnectorRadio({ data: { name, logo, logoDark, description } }: Props) {
  return (
    <div className={styles.connector}>
      <ConnectorLogo data={{ logo, logoDark }} />
      <div className={styles.content}>
        <div className={classNames(styles.name)}>
          <UnnamedTrans resource={name} />
        </div>
        <div className={styles.description}>
          <UnnamedTrans resource={description} />
        </div>
      </div>
    </div>
  );
}

export default ConnectorRadio;
