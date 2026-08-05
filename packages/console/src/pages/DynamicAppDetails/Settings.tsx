import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { dynamicApp } from '@/consts/external-links';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

/**
 * The dynamic app has no application record, so its name and description are fixed copy rather
 * than editable fields.
 */
function Settings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="application_details.settings"
      description="applications.dynamic_app.settings_description"
      learnMoreLink={{ href: dynamicApp }}
    >
      <FormField title="application_details.application_name">
        <TextInput readOnly value={t('applications.dynamic_app.title')} />
      </FormField>
      <FormField title="application_details.description">
        <TextInput readOnly value={t('applications.dynamic_app.description')} />
      </FormField>
    </FormCard>
  );
}

export default Settings;
