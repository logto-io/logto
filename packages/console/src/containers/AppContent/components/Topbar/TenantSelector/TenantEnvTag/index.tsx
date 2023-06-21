import type { AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas/models';
import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  tag: TenantTag;
  className?: string;
};

type TenantTagMap = {
  [key in TenantTag]: AdminConsoleKey;
};

export const tenantTagMap = Object.freeze({
  [TenantTag.Development]: 'tenants.settings.environment_tag_development',
  [TenantTag.Staging]: 'tenants.settings.environment_tag_staging',
  [TenantTag.Production]: 'tenants.settings.environment_tag_production',
}) satisfies TenantTagMap;

function TenantEnvTag({ tag, className }: Props) {
  return (
    <div className={classNames(styles.tag, styles[tag], className)}>
      <div className={styles.text}>
        <DynamicT forKey={tenantTagMap[tag]} />
      </div>
    </div>
  );
}

export default TenantEnvTag;
