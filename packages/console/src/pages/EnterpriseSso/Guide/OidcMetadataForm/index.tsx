import { useFormContext } from 'react-hook-form';

import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import { type OidcGuideFormType } from '../../types.js';

function OidcMetadataForm() {
  const { register } = useFormContext<OidcGuideFormType>();

  return (
    <div>
      <FormField title="enterprise_sso.metadata.oidc.client_id_field_name">
        <TextInput {...register('clientId')} />
      </FormField>
      <FormField title="enterprise_sso.metadata.oidc.client_secret_field_name">
        <TextInput {...register('clientSecret')} />
      </FormField>
      <FormField title="enterprise_sso.metadata.oidc.issuer_field_name">
        <TextInput {...register('issuer')} />
      </FormField>
      <FormField title="enterprise_sso.metadata.oidc.scope_field_name">
        <TextInput {...register('scope')} />
      </FormField>
    </div>
  );
}

export default OidcMetadataForm;
