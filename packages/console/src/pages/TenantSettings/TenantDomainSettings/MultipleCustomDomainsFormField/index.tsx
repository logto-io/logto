import { DomainStatus, type Domain } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import LearnMore from '@/components/LearnMore';
import { customDomain as customDomainDocumentationLink } from '@/consts/external-links';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useCustomDomain from '@/hooks/use-custom-domain';

import AddDomainForm from '../AddDomainForm';
import CustomDomain from '../CustomDomain';

import styles from './index.module.scss';

function MultipleCustomDomainsFormField() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { allDomains, mutate } = useCustomDomain(true);
  const api = useApi();
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();

  return (
    <>
      <FormField title="domain.custom.add_custom_domain_field">
        <AddDomainForm
          isReadonly={!canManageTenant}
          onSubmitCustomDomain={async (json) => {
            const createdDomain = await api.post('api/domains', { json }).json<Domain>();
            mutate(createdDomain);
          }}
        />
      </FormField>
      {allDomains && allDomains.length > 0 && (
        <FormField title="domain.custom.custom_domain_field">
          {allDomains.map((domain) => (
            <CustomDomain
              key={domain.id}
              hasExtraTipsOnDelete
              className={styles.domainItem}
              isReadonly={!canManageTenant}
              customDomain={domain}
              onDeleteCustomDomain={async () => {
                await api.delete(`api/domains/${domain.id}`);
                mutate();
              }}
            />
          ))}
          {allDomains.some(({ status }) => status === DomainStatus.Active) && (
            <div className={styles.configDescription}>
              {t('domain.custom.config_custom_domain_description')}
              <LearnMore href={customDomainDocumentationLink} />{' '}
            </div>
          )}
        </FormField>
      )}
    </>
  );
}

export default MultipleCustomDomainsFormField;
