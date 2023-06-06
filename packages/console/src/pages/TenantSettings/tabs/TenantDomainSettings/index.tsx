import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';

import DefaultDomain from './components/DefaultDomain';

function TenantDomainSettings() {
  return (
    <div>
      {/* TODO: @xiaoyijun add the custom domain form card */}
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

export default TenantDomainSettings;
