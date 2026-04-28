import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import { isCloud } from '@/consts/env';
import InlineNotification from '@/ds-components/InlineNotification';
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
    data: userPreferences,
    isLoading: isLoadingUserPreferences,
    update,
  } = useUserPreferences();
  const cloudOidcPrivateKeyRotationNoticeAcknowledged = Boolean(
    userPreferences.cloudOidcPrivateKeyRotationNoticeAcknowledged
  );
  const formMethods = useForm<OidcConfigFormData>();
  const { errorMessage, onSubmit } = useSessionConfigForm(formMethods);

  const {
    reset,
    formState: { isDirty, isSubmitting },
  } = formMethods;

  return (
    <div className={styles.container}>
      {isCloud && !isLoadingUserPreferences && !cloudOidcPrivateKeyRotationNoticeAcknowledged && (
        <InlineNotification
          action="general.got_it"
          onClick={() => {
            void update({ cloudOidcPrivateKeyRotationNoticeAcknowledged: true });
          }}
        >
          {t('oidc_configs.cloud_private_key_rotation_notice')}
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
