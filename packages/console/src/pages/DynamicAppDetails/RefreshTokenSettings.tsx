import FormCard from '@/components/FormCard';
import RefreshTokenTtlField from '@/components/RefreshTokenTtlField';

import { type SettingsFormData } from './types';

/**
 * Only the TTL applies to dynamic apps: rotation follows the provider defaults, and issuance follows
 * `offline_access`. The registered application tip is left out, as rotation keeps a fixed lifetime.
 */
function RefreshTokenSettings() {
  return (
    <FormCard
      title="application_details.refresh_token_settings"
      description="applications.dynamic_app.refresh_token_settings_description"
    >
      <RefreshTokenTtlField<SettingsFormData> isRequired name="refreshTokenTtlInDays" />
    </FormCard>
  );
}

export default RefreshTokenSettings;
