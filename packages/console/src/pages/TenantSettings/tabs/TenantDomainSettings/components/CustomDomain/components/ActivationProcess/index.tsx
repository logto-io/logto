import {
  DomainStatus,
  type Domain,
  type DomainDnsRecords,
  type DomainDnsRecord,
} from '@logto/schemas';

import { isDomainStatus } from '../../utils';

import DnsRecordsTable from './components/DnsRecordsTable';
import Step from './components/Step';
import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
};

const isSetupSslDnsRecord = ({ type, name }: DomainDnsRecord) =>
  type.toUpperCase() === 'TXT' && name.includes('_acme-challenge');

function ActivationProcess({ customDomain }: Props) {
  const { dnsRecords, status } = customDomain;

  // TODO @xiaoyijun Remove this type assertion when the LOG-6276 issue is done by @wangsijie
  const typedDomainStatus = isDomainStatus(status) ? status : DomainStatus.Error;

  const { verifyDomainDnsRecord, setupSslDnsRecord } = dnsRecords.reduce<{
    verifyDomainDnsRecord: DomainDnsRecords;
    setupSslDnsRecord: DomainDnsRecords;
  }>(
    (result, record) =>
      isSetupSslDnsRecord(record)
        ? {
            ...result,
            setupSslDnsRecord: [...result.setupSslDnsRecord, record],
          }
        : {
            ...result,
            verifyDomainDnsRecord: [...result.verifyDomainDnsRecord, record],
          },
    {
      verifyDomainDnsRecord: [],
      setupSslDnsRecord: [],
    }
  );

  return (
    <div className={styles.container}>
      <Step
        step={1}
        title="domain.custom.verify_domain"
        tip="domain.custom.checking_dns_tip"
        domainStatus={typedDomainStatus}
      >
        <DnsRecordsTable records={verifyDomainDnsRecord} />
      </Step>
      <Step
        step={2}
        title="domain.custom.enable_ssl"
        tip="domain.custom.checking_dns_tip"
        domainStatus={typedDomainStatus}
      >
        <DnsRecordsTable records={setupSslDnsRecord} />
      </Step>
    </div>
  );
}

export default ActivationProcess;
