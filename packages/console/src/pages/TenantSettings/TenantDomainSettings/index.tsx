import { withAppInsights } from '@logto/app-insights/react';
import { type Domain, DomainStatus } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useCustomDomain from '@/hooks/use-custom-domain';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import Skeleton from '../components/Skeleton';

import AddDomainForm from './AddDomainForm';
import CustomDomain from './CustomDomain';
import DefaultDomain from './DefaultDomain';
import * as styles from './index.module.scss';

function TenantDomainSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: customDomain, isLoading: isLoadingCustomDomain, mutate } = useCustomDomain(true);
  const { getDocumentationUrl } = useDocumentationUrl();
  const api = useApi();
  const { canManageTenant } = useCurrentTenantScopes();

  if (isLoadingCustomDomain) {
    return <Skeleton />;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.domains', 'tenants.title']} />
      <FormCard
        title="domain.custom.custom_domain"
        description="domain.custom.custom_domain_description"
        learnMoreLink={{
          href: getDocumentationUrl('docs/recipes/custom-domain'),
          targetBlank: 'noopener',
        }}
      >
        <FormField title="domain.custom.custom_domain_field">
          {customDomain ? (
            <CustomDomain
              hasExtraTipsOnDelete
              isReadonly={!canManageTenant}
              customDomain={customDomain}
              onDeleteCustomDomain={async () => {
                await api.delete(`api/domains/${customDomain.id}`);
                mutate();
              }}
            />
          ) : (
            <AddDomainForm
              isReadonly={!canManageTenant}
              onSubmitCustomDomain={async (json) => {
                const createdDomain = await api.post('api/domains', { json }).json<Domain>();
                mutate(createdDomain);
              }}
            />
          )}
          {customDomain?.status === DomainStatus.Active && (
            <div className={styles.notes}>
              <Trans
                components={{
                  a: (
                    <TextLink
                      targetBlank="noopener"
                      to={getDocumentationUrl('docs/recipes/custom-domain/use-custom-domain')}
                    />
                  ),
                }}
              >
                {t('domain.update_endpoint_notice', { link: t('general.learn_more') })}
              </Trans>
            </div>
          )}
        </FormField>
      </FormCard>
      <FormCard
        title="domain.default.default_domain"
        description="domain.default.default_domain_description"
      >
        <FormField title="domain.default.default_domain_field">
          <DefaultDomain />
        </FormField>
      </FormCard>
    </div>
  );
}

export default withAppInsights(TenantDomainSettings);
