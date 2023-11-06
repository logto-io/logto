import type { AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas/models';
import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  tag: TenantTag;
  className?: string;
  isAbbreviated?: boolean;
  size?: 'default' | 'large';
};

type TenantTagMap = {
  [key in TenantTag]: AdminConsoleKey;
};

export const tenantAbbreviatedTagNameMap = Object.freeze({
  [TenantTag.Development]: 'tenants.settings.environment_tag_development',
  // Todo @xiaoyijun Remove staging tag before release
  [TenantTag.Staging]: 'tenants.settings.environment_tag_staging',
  [TenantTag.Production]: 'tenants.settings.environment_tag_production',
}) satisfies TenantTagMap;

const tenantTagNameMap = Object.freeze({
  [TenantTag.Development]: 'tenants.full_env_tag.development',
  // Todo @xiaoyijun Remove staging tag before release
  [TenantTag.Staging]: 'tenants.settings.environment_tag_staging',
  [TenantTag.Production]: 'tenants.full_env_tag.production',
}) satisfies TenantTagMap;

function TenantEnvTag({ tag, className, isAbbreviated = true, size = 'default' }: Props) {
  const phrasesMap = isAbbreviated ? tenantAbbreviatedTagNameMap : tenantTagNameMap;

  return (
    <div className={classNames(styles.tag, styles[tag], styles[size], className)}>
      <DynamicT forKey={phrasesMap[tag]} />
    </div>
  );
}

export default TenantEnvTag;
