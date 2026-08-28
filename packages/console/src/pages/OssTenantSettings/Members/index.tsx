import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import MembersBg from '@/assets/icons/members-bg.svg?url';
import { isDevFeaturesEnabled } from '@/consts/env';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import DynamicT from '@/ds-components/DynamicT';
import { openCloudUpsell, openSelfHostedPlansUpsell, ossUpsellEntries } from '@/utils/oss-upsell';

import { getOssTenantMembersUpsellCopyKeys } from '../utils';

import styles from './index.module.scss';

function Members() {
  const copyKeys = getOssTenantMembersUpsellCopyKeys({ isDevFeaturesEnabled });

  return (
    <Card className={styles.card}>
      <div className={styles.content}>
        <img alt="" className={styles.image} src={MembersBg} />
        <div className={styles.textContent}>
          <div className={styles.title}>
            <DynamicT forKey={copyKeys.title} />
          </div>
          <div className={styles.description}>
            <DynamicT forKey={copyKeys.description} />
          </div>
        </div>
        <Button
          className={styles.action}
          type="primary"
          title={copyKeys.action}
          trailingIcon={<ExternalLinkIcon />}
          onClick={() => {
            const entry = ossUpsellEntries.tenantSettingsMembersOssUpsell;
            // DEV: self-hosted plans
            const openUpsell = isDevFeaturesEnabled ? openSelfHostedPlansUpsell : openCloudUpsell;

            openUpsell({ entry });
          }}
        />
      </div>
    </Card>
  );
}

export default Members;
