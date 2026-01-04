import { type Application, ApplicationType } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { personalAccessToken, userImpersonation } from '@/consts/external-links';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import styles from './index.module.scss';
import { type ApplicationForm } from './utils';

type Props = {
  readonly data: Application;
};

function TokenExchangeSettings({ data: { type, isThirdParty } }: Props) {
  const { register, watch } = useFormContext<ApplicationForm>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const allowTokenExchange = watch('customClientMetadata.allowTokenExchange');
  const isPublicClient = [ApplicationType.SPA, ApplicationType.Native].includes(type);

  // Don't show for third-party apps (they are not allowed to use token exchange)
  if (isThirdParty) {
    return null;
  }

  return (
    <FormCard
      title="application_details.token_exchange"
      description="application_details.token_exchange_description"
    >
      <FormField title="application_details.allow_token_exchange">
        <Switch
          label={
            <Trans
              components={{
                impersonationLink: (
                  <TextLink href={getDocumentationUrl(userImpersonation)} targetBlank="noopener" />
                ),
                patLink: (
                  <TextLink
                    href={getDocumentationUrl(personalAccessToken)}
                    targetBlank="noopener"
                  />
                ),
              }}
            >
              {t('application_details.allow_token_exchange_description')}
            </Trans>
          }
          {...register('customClientMetadata.allowTokenExchange')}
        />
        {isPublicClient && allowTokenExchange && (
          <InlineNotification severity="alert" className={styles.mixedUriWarning}>
            {t('application_details.allow_token_exchange_public_client_warning')}
          </InlineNotification>
        )}
      </FormField>
    </FormCard>
  );
}

export default TokenExchangeSettings;
