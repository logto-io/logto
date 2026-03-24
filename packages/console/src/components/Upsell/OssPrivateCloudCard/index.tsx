import ConvertTenantHeaderIcon from '@/assets/icons/convert-tenant-header.svg?react';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import DangerousRaw from '@/ds-components/DangerousRaw';

import styles from './index.module.scss';

function OssPrivateCloudCard() {
  return (
    <Card className={styles.card}>
      <div className={styles.title}>Need compliance or custom deployment?</div>
      <div className={styles.borderBox}>
        <div className={styles.iconWrapper}>
          <ConvertTenantHeaderIcon />
        </div>
        <div className={styles.content}>
          <div className={styles.heading}>Private Cloud</div>
          <div className={styles.description}>
            Get a dedicated Logto instance with full data isolation, custom domain, and SLA guarantees. Perfect for enterprises with strict data residency or compliance requirements. We handle the infrastructure so you can focus on your product.
          </div>
        </div>
        <Button
          type="outline"
          size="medium"
          title={<DangerousRaw>Contact us</DangerousRaw>}
          onClick={() => {
            window.open('mailto:contact@logto.io');
          }}
        />
      </div>
    </Card>
  );
}

export default OssPrivateCloudCard;
