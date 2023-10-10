import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useVerifyWebAuthn from '@/hooks/use-verify-webauthn';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { mfaFactorsStateGuard } from '@/types/guard';

import * as styles from './index.module.scss';

const WebAuthnVerification = () => {
  const { state } = useLocation();
  const [, mfaFactorsState] = validate(state, mfaFactorsStateGuard);

  const verifyWebAuthn = useVerifyWebAuthn();

  if (!mfaFactorsState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { availableFactors } = mfaFactorsState;

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.verify_via_passkey"
        description="mfa.verify_via_passkey_description"
      >
        <Button
          title="action.verify_via_passkey"
          className={styles.verifyButton}
          onClick={verifyWebAuthn}
        />
      </SectionLayout>
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink flow={UserMfaFlow.MfaVerification} factors={availableFactors} />
      )}
    </SecondaryPageLayout>
  );
};

export default WebAuthnVerification;
