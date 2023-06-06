import {
  DomainStatus,
  type Domain,
  type DomainDnsRecords,
  type DomainDnsRecord,
} from '@logto/schemas';

import { isDomainStatus } from '../../utils';

import ActiveStep from './components/ActiveStep';
import { StepStatus } from './components/ActiveStepStatus';
import DnsRecordsTable from './components/DnsRecordsTable';
import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
};

const domainStatusToStep: Record<DomainStatus, number> = {
  /**
   * TODO @xiaoyijun
   * Aligned with designers how to handle error status since error is a global state, and we don't have an error for each step.
   * The error handling logic will be implemented in the error handling PR.
   */
  [DomainStatus.Error]: 0,
  [DomainStatus.PendingVerification]: 1,
  [DomainStatus.PendingSsl]: 2,
  [DomainStatus.Active]: 3,
};

const getStepStatus = (step: number, domainStatus: DomainStatus): StepStatus => {
  const domainStatusStep = domainStatusToStep[domainStatus];

  if (step < domainStatusStep) {
    return StepStatus.Finished;
  }

  if (step === domainStatusStep) {
    return StepStatus.Loading;
  }

  return StepStatus.Pending;
};

const isSetupSslDnsRecord = ({ type, name }: DomainDnsRecord) =>
  type.toUpperCase() === 'TXT' && name.includes('_acme-challenge');

function ActiveProcess({ customDomain }: Props) {
  const { dnsRecords, status } = customDomain;

  // TODO @xiaoyijun Remove this type assertion when the LOG-6276 issue is done by @wangsijie
  const typedStatus = isDomainStatus(status) ? status : DomainStatus.Error;

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
      <ActiveStep
        step={1}
        title="domain.custom.verify_domain"
        tip="domain.custom.checking_dns_tip"
        status={getStepStatus(1, typedStatus)}
      >
        <DnsRecordsTable records={verifyDomainDnsRecord} />
      </ActiveStep>
      <ActiveStep
        step={2}
        title="domain.custom.enable_ssl"
        tip="domain.custom.checking_dns_tip"
        status={getStepStatus(2, typedStatus)}
      >
        <DnsRecordsTable records={setupSslDnsRecord} />
      </ActiveStep>
    </div>
  );
}

export default ActiveProcess;
