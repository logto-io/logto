import { TenantTag } from '@logto/schemas/models';
import classNames from 'classnames';

import DangerousRaw from '@/ds-components/DangerousRaw';

import * as styles from './index.module.scss';

type Props = {
  tag: TenantTag;
  className?: string;
};

const tenantTagMap: Record<TenantTag, string> = Object.freeze({
  [TenantTag.Development]: 'Dev',
  [TenantTag.Staging]: 'Staging',
  [TenantTag.Production]: 'Prod',
});

function TenantEnvTag({ tag, className }: Props) {
  return (
    <div className={classNames(styles.tag, styles[tag], className)}>
      <div className={styles.text}>
        <DangerousRaw>{tenantTagMap[tag]}</DangerousRaw>
      </div>
    </div>
  );
}

export default TenantEnvTag;
