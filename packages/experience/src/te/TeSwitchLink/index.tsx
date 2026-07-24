/* TE:BEGIN qr-push-factor */
/**
 * "Try another method to verify" for the TripleEnable screens, so switching factors
 * works from here just like it does from password, code and passkey.
 *
 * It reuses Logto's own link component and feeds it the same props those pages do.
 * The methods list needs an identifier to know what it can offer, so the link stays
 * hidden until there is one — which is the case on the QR screen, reachable before
 * the user has typed anything.
 */

import { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import SwitchToVerificationMethodsLink from '@/components/SwitchToVerificationMethodsLink';
import { useSieMethods } from '@/hooks/use-sie';

type Props = {
  readonly className?: string;
};

const TeSwitchLink = ({ className }: Props) => {
  const { identifierInputValue } = useContext(UserInteractionContext);
  const { signInMethods } = useSieMethods();

  if (!identifierInputValue?.type) {
    return null;
  }

  const { type, value } = identifierInputValue;
  const methodSetting = signInMethods.find((method) => method.identifier === type);

  return (
    <SwitchToVerificationMethodsLink
      className={className}
      identifier={type === SignInIdentifier.Username ? undefined : type}
      value={value}
      hasPassword={methodSetting?.password}
      hasVerificationCode={
        type !== SignInIdentifier.Username && Boolean(methodSetting?.verificationCode)
      }
    />
  );
};

export default TeSwitchLink;
/* TE:END qr-push-factor */
