import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import SwitchToVerificationMethodsLink from '@/components/SwitchToVerificationMethodsLink';
import useIdentifierPasskeySignInVerification from '@/hooks/use-identifier-passkey-sign-in-verification';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import { identifierPasskeyStateGuard } from '@/types/guard';
import { isWebAuthnOptions } from '@/utils/webauthn';

import styles from './index.module.scss';

/**
 * Passkey verification page for the identifier-based sign-in flow.
 *
 * This page is shown when:
 * 1. User enters an identifier (email/phone/username) on the sign-in form
 * 2. The tenant has passkey sign-in enabled
 * 3. The user has passkey credentials registered
 *
 * It allows the user to verify their identity using a passkey,
 * with a link to switch to other verification methods (password/verification code).
 *
 * WebAuthn options are passed via navigation state.
 * Identifier is read from UserInteractionContext.
 * Available methods are determined from useSieMethods().
 */
const SignInPasskeyVerification = () => {
  const { state } = useLocation();
  const [, passkeyState] = validate(state, identifierPasskeyStateGuard);
  const { verificationIdsMap, identifierInputValue } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.SignInWebAuthn];
  const { signInMethods } = useSieMethods();

  const handleVerify = useIdentifierPasskeySignInVerification();
  const [isVerifying, setIsVerifying] = useState(false);

  if (!passkeyState || !verificationId || !identifierInputValue?.type) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { options } = passkeyState;

  if (!isWebAuthnOptions(options)) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { type } = identifierInputValue;

  // Check if alternative methods are available
  const methodSetting = signInMethods.find((method) => method.identifier === type);

  return (
    <SecondaryPageLayout
      title="action.verify_via_passkey"
      description="mfa.verify_via_passkey_description"
    >
      <Button
        title="action.verify_via_passkey"
        className={styles.verifyButton}
        isLoading={isVerifying}
        onClick={async () => {
          setIsVerifying(true);
          await handleVerify(options, verificationId);
          setIsVerifying(false);
        }}
      />
      <SwitchToVerificationMethodsLink
        className={styles.switchLink}
        identifier={cond(type !== SignInIdentifier.Username && type)}
        value={identifierInputValue.value}
        hasPassword={methodSetting?.password}
        hasVerificationCode={type !== SignInIdentifier.Username && methodSetting?.verificationCode}
      />
    </SecondaryPageLayout>
  );
};

export default SignInPasskeyVerification;
