import { FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import { isCloud } from '@/consts/env';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useUserPreferences from '@/hooks/use-user-preferences';

import SessionsFormCard from './SessionsFormCard';
import SigningKeysFormCard from './SigningKeysFormCard';
import styles from './index.module.scss';
import useSessionConfigForm, { type SessionConfigFormData } from './use-session-config-form';

type OidcConfigFormData = {
  session: SessionConfigFormData;
};

function OidcConfigs() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    data: { ossOidcConfigNoticeAcknowledged },
    isLoading: isLoadingUserPreferences,
    update,
  } = useUserPreferences();
  const formMethods = useForm<OidcConfigFormData>();
  const { errorMessage, onSubmit } = useSessionConfigForm(formMethods);

  const {
    reset,
    formState: { isDirty, isSubmitting },
  } = formMethods;

  return (
    <div className={styles.container}>
      {!isCloud && !isLoadingUserPreferences && !ossOidcConfigNoticeAcknowledged && (
        <InlineNotification
          action="general.got_it"
          onClick={() => {
            void update({ ossOidcConfigNoticeAcknowledged: true });
          }}
        >
          <Trans
            components={{
              keyRotationsLink: (
                <TextLink
                  href="https://docs.logto.io/developers/signing-keys#rotate-signing-keys-from-console-ui"
                  targetBlank="noopener"
                />
              ),
              centralCacheLink: (
                <TextLink
                  href="https://docs.logto.io/logto-oss/central-cache"
                  targetBlank="noopener"
                />
              ),
            }}
          >
            {t('oidc_configs.oss_notice')}
          </Trans>
        </InlineNotification>
      )}
      <FormProvider {...formMethods}>
        <DetailsForm
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onDiscard={reset}
        >
          <SessionsFormCard errorMessage={errorMessage} />
          <SigningKeysFormCard />
        </DetailsForm>
      </FormProvider>
    </div>
  );
}

export default OidcConfigs;
