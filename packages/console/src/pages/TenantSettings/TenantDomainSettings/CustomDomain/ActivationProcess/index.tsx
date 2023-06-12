import { type Domain } from '@logto/schemas';

import DynamicT from '@/components/DynamicT';
import InlineNotification from '@/components/InlineNotification';
import { customDomainSyncInterval } from '@/consts/custom-domain';

import DnsRecordsTable from './DnsRecordsTable';
import Step from './Step';
import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
};

function ActivationProcess({ customDomain }: Props) {
  const { dnsRecords, status: domainStatus, errorMessage } = customDomain;

  return (
    <div className={styles.container}>
      {errorMessage && (
        <InlineNotification className={styles.errorNotification} severity="error">
          {errorMessage}
          <div className={styles.hint}>
            <DynamicT
              forKey="domain.error_hint"
              interpolation={{ value: customDomainSyncInterval }}
            />
          </div>
        </InlineNotification>
      )}
      <Step
        step={1}
        title="domain.custom.verify_domain"
        tip="domain.custom.checking_dns_tip"
        domainStatus={domainStatus}
      >
        <DnsRecordsTable records={dnsRecords} />
      </Step>
      <Step
        step={2}
        title="domain.custom.enable_ssl"
        tip="domain.custom.enable_ssl_tip"
        domainStatus={domainStatus}
      />
    </div>
  );
}

export default ActivationProcess;
