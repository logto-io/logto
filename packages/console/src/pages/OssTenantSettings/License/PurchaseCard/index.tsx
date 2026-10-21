import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';

import { buildLicensePurchaseUrl } from '../utils';

import styles from './index.module.scss';

function PurchaseCard() {
  return (
    <FormCard title="tenants.license.purchase_title">
      <div className={styles.description}>
        <DynamicT forKey="tenants.license.purchase_description" />
      </div>
      <div className={styles.purchase}>
        <Button
          type="primary"
          title="tenants.license.purchase_button"
          trailingIcon={<ExternalLinkIcon />}
          onClick={() => {
            window.open(buildLicensePurchaseUrl(), '_blank', 'noopener,noreferrer');
          }}
        />
      </div>
    </FormCard>
  );
}

export default PurchaseCard;
