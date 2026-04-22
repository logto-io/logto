import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import MembersBg from '@/assets/icons/members-bg.svg?url';
import { logtoCloudConsoleUrl } from '@/consts';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import DynamicT from '@/ds-components/DynamicT';

import { getOssTenantMembersUpsellCopyKeys } from '../utils';

import styles from './index.module.scss';

function Members() {
  const copyKeys = getOssTenantMembersUpsellCopyKeys();

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
            window.open(logtoCloudConsoleUrl, '_blank', 'noopener,noreferrer');
          }}
        />
      </div>
    </Card>
  );
}

export default Members;
