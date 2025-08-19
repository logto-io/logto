import { MfaFactor, SignInIdentifier } from '@logto/schemas';
import { useEffect, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import { sendMfaVerificationCode } from '@/apis/experience';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import MfaCodeVerification from '@/containers/MfaCodeVerification';
import useErrorHandler from '@/hooks/use-error-handler';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import styles from './index.module.scss';

const EmailVerificationCode = () => {
  const flowState = useMfaFlowState();
  const [verificationId, setVerificationId] = useState<string>();
  const handleError = useErrorHandler();

  useEffect(() => {
    void (async () => {
      try {
        const { verificationId } = await sendMfaVerificationCode(SignInIdentifier.Email);
        setVerificationId(verificationId);
      } catch (error) {
        await handleError(error);
      }
    })();
  }, [handleError]);

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const maskedEmail = flowState.maskedIdentifiers?.[MfaFactor.EmailVerificationCode];

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.enter_email_verification_code"
        description="mfa.enter_email_verification_code_description"
        descriptionProps={{ identifier: maskedEmail }}
      >
        {verificationId ? (
          <MfaCodeVerification
            identifierType={SignInIdentifier.Email}
            verificationId={verificationId}
          />
        ) : null}
      </SectionLayout>
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaVerification}
        flowState={flowState}
        className={styles.switchFactorLink}
      />
    </SecondaryPageLayout>
  );
};

export default EmailVerificationCode;
