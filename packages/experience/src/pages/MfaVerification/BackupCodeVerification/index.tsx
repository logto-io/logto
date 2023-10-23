import { MfaFactor } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import Button from '@/components/Button';
import { InputField } from '@/components/InputFields';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useMfaFactorsState from '@/hooks/use-mfa-factors-state';
import useSendMfaPayload from '@/hooks/use-send-mfa-payload';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';

type FormState = {
  code: string;
};

const BackupCodeVerification = () => {
  const mfaFactorsState = useMfaFactorsState();
  const sendMfaPayload = useSendMfaPayload();
  const { register, handleSubmit } = useForm<FormState>({ defaultValues: { code: '' } });

  const onSubmitHandler = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      void handleSubmit(async ({ code }) => {
        void sendMfaPayload({
          flow: UserMfaFlow.MfaVerification,
          payload: { type: MfaFactor.BackupCode, code },
        });
      })(event);
    },
    [handleSubmit, sendMfaPayload]
  );

  if (!mfaFactorsState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { availableFactors } = mfaFactorsState;

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.enter_a_backup_code"
        description="mfa.enter_backup_code_description"
      >
        <form onSubmit={onSubmitHandler}>
          <InputField
            placeholder={t('input.backup_code')}
            className={styles.backupCodeInput}
            {...register('code')}
          />
          <Button title="action.continue" htmlType="submit" />
        </form>
      </SectionLayout>
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink
          flow={UserMfaFlow.MfaVerification}
          factors={availableFactors}
          className={styles.switchFactorLink}
        />
      )}
    </SecondaryPageLayout>
  );
};

export default BackupCodeVerification;
