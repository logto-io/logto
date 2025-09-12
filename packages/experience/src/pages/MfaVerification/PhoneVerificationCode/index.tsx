import { MfaFactor, SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import MfaCodeVerification from '@/containers/MfaCodeVerification';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

import styles from './index.module.scss';

const PhoneVerificationCode = () => {
  const flowState = useMfaFlowState();
  const { verificationIdsMap } = useContext(UserInteractionContext);

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  // VerificationId not found
  const verificationId = verificationIdsMap[codeVerificationTypeMap.phone];
  if (!verificationId) {
    return <ErrorPage title="error.invalid_session" rawMessage="Verification ID not found" />;
  }

  const maskedPhone = flowState.maskedIdentifiers?.[MfaFactor.PhoneVerificationCode];

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.enter_phone_verification_code"
        description="mfa.enter_phone_verification_code_description"
        descriptionProps={{ identifier: maskedPhone }}
      >
        {verificationId ? (
          <MfaCodeVerification
            identifierType={SignInIdentifier.Phone}
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

export default PhoneVerificationCode;
