import { DomainStatus, type Domain } from '@logto/schemas';

import LearnMore from '@/components/LearnMore';
import { customDomain as customDomainDocumentationLink } from '@/consts/external-links';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useCustomDomain from '@/hooks/use-custom-domain';

import AddDomainForm from '../AddDomainForm';
import CustomDomain from '../CustomDomain';

import styles from './index.module.scss';

function SingleCustomDomainFormField() {
  const { data: customDomain, mutate } = useCustomDomain(true);
  const api = useApi();
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();

  return (
    <FormField title="domain.custom.custom_domain_field">
      {!customDomain && (
        <AddDomainForm
          isReadonly={!canManageTenant}
          onSubmitCustomDomain={async (json) => {
            const createdDomain = await api.post('api/domains', { json }).json<Domain>();
            mutate(createdDomain);
          }}
        />
      )}
      {customDomain && (
        <>
          <CustomDomain
            hasExtraTipsOnDelete
            isReadonly={!canManageTenant}
            customDomain={customDomain}
            onDeleteCustomDomain={async () => {
              await api.delete(`api/domains/${customDomain.id}`);
              mutate();
            }}
          />
          {customDomain.status === DomainStatus.Active && (
            <div className={styles.notes}>
              <LearnMore href={customDomainDocumentationLink} />
            </div>
          )}
        </>
      )}
    </FormField>
  );
}

export default SingleCustomDomainFormField;
