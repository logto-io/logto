import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendVerificationCode } from '@/apis/experience';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useErrorHandler from '@/hooks/use-error-handler';
import useSkipMfa from '@/hooks/use-skip-mfa';
import IdentifierProfileForm from '@/pages/Continue/IdentifierProfileForm';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { mfaFlowStateGuard } from '@/types/guard';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

import styles from './index.module.scss';

const EmailMfaBinding = () => {
  const { state } = useLocation();
  const [, mfaFlowState] = validate(state, mfaFlowStateGuard);
  const { setVerificationId, setIdentifierInputValue } = useContext(UserInteractionContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const skipMfa = useSkipMfa();
  const handleError = useErrorHandler();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const handleSubmit = useCallback(
    async (_identifier: SignInIdentifier, value: string) => {
      const identifier = { type: SignInIdentifier.Email as const, value };

      try {
        // TODO @wangsijie LOG-11874: Implement the email verification code template
        const result = await sendVerificationCode(InteractionEvent.Register, identifier);

        setVerificationId(codeVerificationTypeMap[SignInIdentifier.Email], result.verificationId);
        setIdentifierInputValue(identifier);

        navigate('/continue/verification-code', {
          state: {
            flow: UserMfaFlow.MfaBinding,
            mfaFlowState,
          },
        });
      } catch (error) {
        await handleError(error, {
          'guard.invalid_input': () => {
            setErrorMessage('invalid_email');
          },
        });
      }
    },
    [handleError, mfaFlowState, navigate, setIdentifierInputValue, setVerificationId]
  );

  if (!mfaFlowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { skippable, availableFactors } = mfaFlowState;

  return (
    <SecondaryPageLayout
      title="mfa.link_email_verification_code_description"
      description="mfa.link_email_2fa_description"
      onSkip={conditional(skippable && skipMfa)}
    >
      <IdentifierProfileForm
        autoFocus
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        defaultType={SignInIdentifier.Email}
        enabledTypes={[SignInIdentifier.Email]}
        onSubmit={handleSubmit}
      />
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink
          flow={UserMfaFlow.MfaBinding}
          flowState={{ availableFactors, skippable }}
          className={styles.switchLink}
        />
      )}
    </SecondaryPageLayout>
  );
};

export default EmailMfaBinding;
