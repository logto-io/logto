import { type AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas';

import TenantEnvTag from '@/components/TenantEnvTag';
import Divider from '@/ds-components/Divider';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import { ReservedPlanName } from '@/types/subscriptions';

import styles from './index.module.scss';

type Props = {
  readonly tag: TenantTag;
  /**
   * Although this parameter is named `isPrivateRegion`, considering our business requirements,
   * it will also determine whether to hide the available production plan information.
   * Set to true when the available production plans should not be displayed,
   * for example, in contexts where this information is not relevant or should be hidden from the user.
   */
  readonly isPrivateRegion: boolean;
};

const getAdminConsoleKeyBy = (tenantTag: TenantTag, isPrivateRegion = false): AdminConsoleKey => {
  if (tenantTag === TenantTag.Production) {
    return 'tenants.create_modal.production_description';
  }
  if (isPrivateRegion) {
    return 'tenants.create_modal.development_description_for_private_regions';
  }
  return 'tenants.create_modal.development_description';
};

const availableProductionPlanNames = [ReservedPlanName.Free, ReservedPlanName.Pro];

function EnvTagOptionContent({ tag, isPrivateRegion = false }: Props) {
  const shouldShowHint = tag === TenantTag.Development || !isPrivateRegion;

  return (
    <div className={styles.container}>
      <TenantEnvTag isAbbreviated={false} tag={tag} size="large" className={styles.tag} />
      <div className={styles.description}>
        <DynamicT forKey={getAdminConsoleKeyBy(tag, isPrivateRegion)} />
      </div>
      {shouldShowHint && (
        <>
          <Divider />
          <div className={styles.hint}>
            {tag === TenantTag.Development && (
              <DynamicT forKey="tenants.create_modal.development_hint" />
            )}
            {tag === TenantTag.Production && (
              <>
                <DynamicT forKey="tenants.create_modal.available_plan" />
                {availableProductionPlanNames.map((planName) => (
                  <Tag key={planName} variant="cell" size="small" className={styles.planNameTag}>
                    {planName}
                  </Tag>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EnvTagOptionContent;
