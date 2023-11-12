import { conditional, pick } from '@silverhand/essentials';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';

import { type SamlGuideFormType } from '../../types.js';

import SwitchFormatButton, { FormFormat } from './SwitchFormatButton';
import * as styles from './index.module.scss';

/**
 * Since we need to reset some of the form fields when we switch the form format
 * for SAML configuration form, here we define this object for convenience.
 */
const completeResetObject: Omit<SamlGuideFormType, 'attributeMapping'> = {
  metadata: undefined,
  metadataUrl: undefined,
  signInEndpoint: undefined,
  entityId: undefined,
  x509Certificate: undefined,
};

type Props = {
  formFormat: FormFormat;
};

function SamlMetadataFormFields({ formFormat }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register } = useFormContext<SamlGuideFormType>();

  switch (formFormat) {
    case FormFormat.Manual: {
      return (
        <>
          <FormField isRequired title="enterprise_sso.metadata.saml.sign_in_endpoint_field_name">
            <TextInput {...register('signInEndpoint')} />
          </FormField>
          <FormField isRequired title="enterprise_sso.metadata.saml.idp_entity_id_field_name">
            <TextInput {...register('entityId')} />
          </FormField>
          <FormField isRequired title="enterprise_sso.metadata.saml.certificate_field_name">
            <Textarea
              {...register('x509Certificate')}
              placeholder={t('enterprise_sso.metadata.saml.certificate_placeholder')}
            />
          </FormField>
        </>
      );
    }
    case FormFormat.Xml: {
      return (
        <FormField title="enterprise_sso.metadata.saml.metadata_xml_field_name">
          <Textarea rows={5} {...register('metadata')} />
        </FormField>
      );
    }
    case FormFormat.Url: {
      return (
        <FormField isRequired title="enterprise_sso.metadata.saml.metadata_url_field_name">
          <TextInput {...register('metadataUrl')} />
          <div className={styles.description}>
            {t('enterprise_sso.metadata.saml.metadata_url_description')}
          </div>
        </FormField>
      );
    }
    default: {
      return null;
    }
  }
}

function SamlMetadataForm() {
  const { reset } = useFormContext<SamlGuideFormType>();
  const [formFormat, setFormFormat] = useState<FormFormat>(FormFormat.Url);

  // If some form format is selected, then fields from other fields should be cleared.
  const onSelect = (formFormat: FormFormat) => {
    reset({
      ...conditional(
        formFormat === FormFormat.Url &&
          pick(completeResetObject, 'metadata', 'entityId', 'signInEndpoint', 'x509Certificate')
      ),
      ...conditional(
        formFormat === FormFormat.Xml &&
          pick(completeResetObject, 'metadataUrl', 'entityId', 'signInEndpoint', 'x509Certificate')
      ),
      ...conditional(
        formFormat === FormFormat.Manual && pick(completeResetObject, 'metadata', 'metadataUrl')
      ),
    });

    setFormFormat(formFormat);
  };

  return (
    <div className={styles.samlMetadataForm}>
      <SamlMetadataFormFields formFormat={formFormat} />
      <SwitchFormatButton value={formFormat} onChange={onSelect} />
    </div>
  );
}

export default SamlMetadataForm;
