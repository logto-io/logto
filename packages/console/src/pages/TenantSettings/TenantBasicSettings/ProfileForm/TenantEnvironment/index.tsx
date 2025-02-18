import { TenantTag } from '@logto/schemas';

import LearnMore from '@/components/LearnMore';
import TenantEnvTag from '@/components/TenantEnvTag';
import { logtoCloudTenantSettings } from '@/consts';
import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';

type Props = {
  readonly tag: TenantTag;
};

function TenantEnvironment({ tag }: Props) {
  return (
    <div className={styles.container}>
      <TenantEnvTag isAbbreviated={false} size="large" tag={tag} />
      <div className={styles.description}>
        <DynamicT
          forKey={
            tag === TenantTag.Development
              ? 'tenants.settings.development_description'
              : 'tenants.settings.production_description'
          }
        />
        {tag === TenantTag.Development && <LearnMore href={logtoCloudTenantSettings} />}
      </div>
    </div>
  );
}

export default TenantEnvironment;
