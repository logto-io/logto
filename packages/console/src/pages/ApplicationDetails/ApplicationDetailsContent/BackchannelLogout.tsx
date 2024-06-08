import { type Application } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';

function BackchannelLogout() {
  const {
    register,
    formState: { errors },
  } = useFormContext<Application>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="application_details.backchannel_logout"
      description="application_details.backchannel_logout_description"
      learnMoreLink={{ href: 'https://openid.net/specs/openid-connect-backchannel-1_0-final.html' }}
    >
      <FormField title="application_details.backchannel_logout_uri">
        <TextInput
          error={errors.oidcClientMetadata?.backchannelLogoutUri?.message}
          placeholder="https://your.website.com/backchannel_logout"
          {...register('oidcClientMetadata.backchannelLogoutUri', {
            validate: (value) =>
              !value ||
              z.string().url().optional().safeParse(value).success ||
              t('errors.invalid_uri_format'),
          })}
        />
      </FormField>
      <FormField title="application_details.backchannel_logout_uri_session_required">
        <Switch
          label={
            <Trans i18nKey="admin_console.application_details.backchannel_logout_uri_session_required_description" />
          }
          {...register('oidcClientMetadata.backchannelLogoutSessionRequired')}
        />
      </FormField>
    </FormCard>
  );
}

export default BackchannelLogout;
