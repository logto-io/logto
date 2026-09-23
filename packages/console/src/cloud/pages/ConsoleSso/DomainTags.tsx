import { useTranslation } from 'react-i18next';

import { type ConsoleSsoConnector } from '@/cloud/types/router';
import Tag from '@/ds-components/Tag';
import styles from '@/pages/EnterpriseSso/index.module.scss';

type Props = { readonly data: Pick<ConsoleSsoConnector, 'boundDomains' | 'domainVerifications'> };

function DomainTags({ data: { boundDomains, domainVerifications } }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.cloud.console_sso' });
  const pending = domainVerifications.filter(({ domain }) => !boundDomains.includes(domain));
  if (boundDomains.length + pending.length === 0) {
    return <>-</>;
  }
  return (
    <div className={styles.domains}>
      {boundDomains.map((domain) => (
        <span
          key={domain}
          role="img"
          title={t('domain_bound')}
          aria-label={`${domain}: ${t('domain_bound')}`}
        >
          <Tag type="state" status="success" variant="cell">
            {domain}
          </Tag>
        </span>
      ))}
      {pending.map(({ domain }) => (
        <span
          key={domain}
          role="img"
          title={t('domain_pending')}
          aria-label={`${domain}: ${t('domain_pending')}`}
        >
          <Tag type="state" status="alert" variant="cell">
            {domain}
          </Tag>
        </span>
      ))}
    </div>
  );
}

export default DomainTags;
