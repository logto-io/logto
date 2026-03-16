import { FormProvider, useForm } from 'react-hook-form';

import DetailsForm from '@/components/DetailsForm';

import SessionsFormCard from './SessionsFormCard';
import SigningKeysFormCard from './SigningKeysFormCard';
import styles from './index.module.scss';
import useSessionConfigForm, { type SessionConfigFormData } from './use-session-config-form';

type OidcConfigFormData = {
  session: SessionConfigFormData;
};

function OidcConfigs() {
  const formMethods = useForm<OidcConfigFormData>();
  const { errorMessage, onSubmit } = useSessionConfigForm(formMethods);

  const {
    reset,
    formState: { isDirty, isSubmitting },
  } = formMethods;

  return (
    <div className={styles.container}>
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
