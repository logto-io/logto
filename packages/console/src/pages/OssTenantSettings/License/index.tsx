import { useContext } from 'react';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import { isDevFeaturesEnabled } from '@/consts/env';
import { selfHostedLicenseGuideLink } from '@/consts/external-links';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

import InstallForm from './InstallForm';
import LicenseDetails from './LicenseDetails';
import PurchaseCard from './PurchaseCard';
import UsageDetails from './UsageDetails';
import UsageReporting from './UsageReporting';
import styles from './index.module.scss';

function License() {
  const { license } = useContext(SubscriptionDataContext);

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.license', 'tenants.title']} />
      {license ? (
        <>
          <LicenseDetails license={license} />
          {/* Self-hosted license usage reporting is still in development. The reporting state is
              only returned by a Core that has the dev feature enabled, so its absence also keeps
              an older Core from showing a wrong state. */}
          {isDevFeaturesEnabled && license.usageReportingEnabled !== undefined && (
            <>
              <UsageDetails license={license} />
              <UsageReporting isEnabled={license.usageReportingEnabled} />
            </>
          )}
        </>
      ) : (
        <>
          <PurchaseCard />
          <FormCard
            title="tenants.license.install_title"
            description="tenants.license.install_description"
            learnMoreLink={{ href: selfHostedLicenseGuideLink }}
          >
            <InstallForm isReplacing={false} />
          </FormCard>
        </>
      )}
    </div>
  );
}

export default License;
