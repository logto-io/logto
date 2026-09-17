import { useContext } from 'react';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

import InstallForm from './InstallForm';
import LicenseDetails from './LicenseDetails';
import PurchaseCard from './PurchaseCard';
import styles from './index.module.scss';

function License() {
  const { license } = useContext(SubscriptionDataContext);

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.license', 'tenants.title']} />
      {license ? (
        <LicenseDetails license={license} />
      ) : (
        <>
          <PurchaseCard />
          <FormCard
            title="tenants.license.install_title"
            description="tenants.license.install_description"
          >
            <InstallForm isReplacing={false} />
          </FormCard>
        </>
      )}
    </div>
  );
}

export default License;
