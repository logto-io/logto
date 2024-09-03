import type { AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas';
import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';

type Props = {
  readonly tag: TenantTag;
  readonly className?: string;
  readonly isAbbreviated?: boolean;
  readonly size?: 'default' | 'large';
};

type TenantTagMap = {
  [key in TenantTag]: AdminConsoleKey;
};

export const tenantAbbreviatedTagNameMap = Object.freeze({
  [TenantTag.Development]: 'tenants.settings.environment_tag_development',
  [TenantTag.Production]: 'tenants.settings.environment_tag_production',
}) satisfies TenantTagMap;

const tenantTagNameMap = Object.freeze({
  [TenantTag.Development]: 'tenants.full_env_tag.development',
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
