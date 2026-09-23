import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg?react';
import ArrowDown from '@/assets/icons/keyboard-arrow-down.svg?react';
import More from '@/assets/icons/more.svg?react';
import { type ConsoleSsoConnector, type ConsoleSsoDomain } from '@/cloud/types/router';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextInput from '@/ds-components/TextInput';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import DnsRecordsTable from '@/pages/TenantSettings/TenantDomainSettings/CustomDomain/ActivationProcess/DnsRecordsTable';

import styles from './index.module.scss';
import { type DomainError, useDomainManager } from './use-domain-manager';

type Props = {
  readonly data: ConsoleSsoConnector;
  readonly onUpdated: () => Promise<void>;
};

function DomainErrorText({ error }: { readonly error: DomainError }) {
  switch (error.code) {
    case 'console_sso.invalid_domain': {
      return <DynamicT forKey="cloud.console_sso.domain_invalid" />;
    }
    case 'console_sso.domain_conflict': {
      return <DynamicT forKey="cloud.console_sso.domain_conflict" />;
    }
    case 'console_sso.invalid_config': {
      return <DynamicT forKey="cloud.console_sso.domain_invalid_provider" />;
    }
    case 'console_sso.dns_lookup_failed': {
      return <DynamicT forKey="cloud.console_sso.domain_dns_timeout" />;
    }
    case 'console_sso.cleanup_failed':
    case 'console_sso.billing_sync_failed':
    case 'console_sso.core_request_failed': {
      return <DynamicT forKey="cloud.console_sso.domain_recovery" />;
    }
    default: {
      return <span>{error.message}</span>;
    }
  }
}

type CardProps = {
  readonly status: ConsoleSsoDomain;
  readonly hasPendingCleanup: boolean;
  readonly isExpanded: boolean;
  readonly error?: DomainError;
  readonly isChecking: boolean;
  readonly isDeleting: boolean;
  readonly onToggle: () => void;
  readonly onVerify: () => Promise<void>;
  readonly onRemove: () => Promise<void>;
};

function DomainCard({
  status,
  hasPendingCleanup,
  isExpanded,
  error,
  isChecking,
  isDeleting,
  onToggle,
  onVerify,
  onRemove,
}: CardProps) {
  const { domain, isBound } = status;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <button
          type="button"
          className={styles.cardToggle}
          aria-expanded={isExpanded}
          onClick={onToggle}
        >
          <span className={styles.domain}>{domain}</span>
          <span className={styles.status}>
            <span className={isBound ? styles.boundDot : styles.pendingDot} />
            <DynamicT
              forKey={
                isBound ? 'cloud.console_sso.domain_bound' : 'cloud.console_sso.domain_pending'
              }
            />
          </span>
          <ArrowDown className={isExpanded ? styles.expandedChevron : styles.chevron} />
        </button>
        <CopyToClipboard value={domain} variant="icon" />
        <ActionMenu
          icon={<More className={styles.moreIcon} />}
          iconSize="small"
          title={<DynamicT forKey="general.more_options" />}
        >
          <ActionMenuItem icon={<Delete />} type="danger" onClick={onRemove}>
            <DynamicT forKey="general.delete" />
          </ActionMenuItem>
        </ActionMenu>
      </div>
      {isExpanded && (
        <div className={styles.cardContent}>
          {isBound ? (
            <div className={styles.statusText}>
              <DynamicT
                forKey={
                  hasPendingCleanup
                    ? 'cloud.console_sso.domain_recovery'
                    : 'cloud.console_sso.domain_bound_description'
                }
              />
            </div>
          ) : (
            <>
              <DnsRecordsTable
                records={status.dnsRecords}
                tip="cloud.console_sso.domain_dns_instructions"
              />
              <div className={styles.statusText}>
                <DynamicT
                  forKey={
                    status.verifiedAt === null
                      ? 'cloud.console_sso.domain_waiting_for_dns'
                      : 'cloud.console_sso.domain_proven_unbound'
                  }
                />
              </div>
            </>
          )}
          {error && (
            <InlineNotification severity="error" className={styles.error}>
              <DomainErrorText error={error} />
            </InlineNotification>
          )}
          {(!isBound || error !== undefined || hasPendingCleanup) && (
            <Button
              type="outline"
              title="domain.custom.verify_domain"
              isLoading={isChecking}
              disabled={isDeleting}
              onClick={onVerify}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DomainManager({ data, onUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { show } = useConfirmModal();
  const {
    domains,
    input,
    setInput,
    inputError,
    expanded,
    errors,
    isAdding,
    checking,
    deleting,
    add,
    verify,
    toggle,
    remove,
  } = useDomainManager({ data, onUpdated });

  const confirmRemove = async (domain: string) => {
    const [confirmed] = await show({
      title: 'domain.custom.deletion.delete_domain',
      confirmButtonText: 'general.delete',
      ModalContent: () => (
        <DynamicT forKey="cloud.console_sso.domain_remove_description" interpolation={{ domain }} />
      ),
    });
    if (confirmed) {
      await remove(domain);
    }
  };

  return (
    <FormField
      title="enterprise_sso_details.email_domain_field_name"
      description="cloud.console_sso.domain_membership_notice"
    >
      <div className={styles.addRow}>
        <TextInput
          value={input}
          aria-label={t('cloud.console_sso.domain_add_placeholder')}
          placeholder={t('cloud.console_sso.domain_add_placeholder')}
          error={inputError && <DomainErrorText error={inputError} />}
          onChange={(event) => {
            setInput(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void add();
            }
          }}
        />
        <Button
          type="primary"
          title="domain.custom.add_domain"
          isLoading={isAdding}
          disabled={!input.trim()}
          onClick={add}
        />
      </div>
      {domains.length > 0 && (
        <div className={styles.cards}>
          {domains.map((status) => (
            <DomainCard
              key={status.domain}
              status={status}
              hasPendingCleanup={
                status.isBound &&
                data.domainVerifications.some(({ domain }) => domain === status.domain)
              }
              isExpanded={expanded === status.domain}
              error={errors[status.domain]}
              isChecking={checking === status.domain}
              isDeleting={deleting === status.domain}
              onToggle={() => {
                toggle(status.domain);
              }}
              onVerify={async () => {
                await verify(status.domain);
              }}
              onRemove={async () => {
                await confirmRemove(status.domain);
              }}
            />
          ))}
        </div>
      )}
    </FormField>
  );
}

export default DomainManager;
