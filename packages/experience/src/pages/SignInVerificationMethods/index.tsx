import { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import FactorEmail from '@/assets/icons/factor-email.svg?react';
import FactorPhone from '@/assets/icons/factor-phone.svg?react';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg?react';
import LockIcon from '@/assets/icons/lock.svg?react';
import useVerificationCodeLink from '@/components/SwitchToVerificationMethodsLink/use-verification-code-link';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { useSieMethods } from '@/hooks/use-sie';
import useStartIdentifierPasskeyProcessing from '@/hooks/use-start-identifier-passkey-processing';
import { UserFlow } from '@/types';

import ErrorPage from '../ErrorPage';

import VerificationMethodCard from './VerificationMethodCard';
import styles from './index.module.scss';

/**
 * Page that shows all available verification methods for sign-in.
 *
 * Displayed when the user has multiple verification options (passkey + password + verification code)
 * and clicks "Try another method" from any single verification page.
 *
 * Reads the identifier from UserInteractionContext and the sign-in method config
 * to determine which methods are available.
 */
const SignInVerificationMethods = () => {
  const { identifierInputValue } = useContext(UserInteractionContext);
  const { signInMethods, passkeySignIn } = useSieMethods();

  const navigate = useNavigateWithPreservedSearchParams();

  const onClickPasskeyMethod = useStartIdentifierPasskeyProcessing();
  const onClickVerificationCodeMethod = useVerificationCodeLink();

  if (!identifierInputValue?.type) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { type, value } = identifierInputValue;
  const methodSetting = signInMethods.find((method) => method.identifier === type);
  const hasPassword = Boolean(methodSetting?.password);
  const hasVerificationCode = Boolean(methodSetting?.verificationCode);
  const hasPasskey = Boolean(passkeySignIn?.enabled);

  return (
    <SecondaryPageLayout
      title="description.verify_identity"
      description="description.choose_verification_method"
    >
      <div className={styles.methodList}>
        {hasPasskey && (
          <VerificationMethodCard
            titleKey="description.verification_method.passkey"
            descriptionKey="description.verification_method.passkey_description"
            Icon={FactorWebAuthn}
            onClick={() => {
              void onClickPasskeyMethod({ type, value });
            }}
          />
        )}
        {hasPassword && (
          <VerificationMethodCard
            titleKey="description.verification_method.password"
            descriptionKey="description.verification_method.password_description"
            Icon={LockIcon}
            onClick={() => {
              navigate({ pathname: `/${UserFlow.SignIn}/password` });
            }}
          />
        )}
        {hasVerificationCode && type !== SignInIdentifier.Username && (
          <VerificationMethodCard
            titleKey={`description.verification_method.${type}_verification_code`}
            descriptionKey="description.verification_method.verification_code_description"
            descriptionProps={{ target: value }}
            Icon={type === SignInIdentifier.Phone ? FactorPhone : FactorEmail}
            onClick={async () => {
              void onClickVerificationCodeMethod({ identifier: type, value });
            }}
          />
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default SignInVerificationMethods;
