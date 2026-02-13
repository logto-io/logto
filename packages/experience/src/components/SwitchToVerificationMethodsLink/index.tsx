import { useLocation } from 'react-router-dom';

import TextLink from '@/components/TextLink';
import useIdentifierSignInMethods from '@/pages/IdentifierSignIn/use-identifier-sign-in-methods';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import { type VerificationCodeIdentifier } from '@/types';

import PasskeySignInLink from './PasskeySignInLink';
import PasswordSignInLink from './PasswordSignInLink';
import VerificationCodeLink from './VerificationCodeLink';

type Props = {
  readonly className?: string;
  readonly hasPassword?: boolean;
  readonly hasVerificationCode?: boolean;
  readonly identifier?: VerificationCodeIdentifier;
  readonly value?: string;
};

/**
 * Link component shown on the password page and verification code page
 * when passkey sign-in is enabled and the user may have passkey credentials.
 *
 * Navigates to the verification methods selection page that shows all available
 * options (passkey, password, verification code).
 *
 * The verification methods page reads identifier from UserInteractionContext
 * and available methods from useSieMethods(), so no extra state is needed.
 */
const SwitchToVerificationMethodsLink = ({
  className,
  hasPassword,
  hasVerificationCode,
  identifier,
  value,
}: Props) => {
  const { pathname } = useLocation();
  const { identifierHasBoundPasskey } = useIdentifierSignInMethods();

  const optionCounts = [identifierHasBoundPasskey, hasPassword, hasVerificationCode].filter(
    Boolean
  ).length;

  if (optionCounts > 2) {
    return (
      <TextLink
        className={className}
        text="mfa.try_another_verification_method"
        icon={<SwitchIcon />}
        to="/sign-in/verification-methods"
      />
    );
  }

  if (identifierHasBoundPasskey && !pathname.endsWith('/sign-in/passkey') && identifier && value) {
    return <PasskeySignInLink className={className} identifier={identifier} value={value} />;
  }
  if (hasPassword && !pathname.endsWith('/sign-in/password')) {
    return <PasswordSignInLink className={className} />;
  }
  if (hasVerificationCode && !pathname.endsWith('/sign-in/passcode') && identifier && value) {
    return <VerificationCodeLink className={className} identifier={identifier} value={value} />;
  }
  return null;
};

export default SwitchToVerificationMethodsLink;
