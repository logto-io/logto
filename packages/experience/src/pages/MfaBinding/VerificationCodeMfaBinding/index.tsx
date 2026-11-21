import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  bindMfaByVerificationCode,
  sendSubjectBindMfaVerificationCode,
  sendVerificationCode,
} from '@/apis/experience';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import MfaCodeVerification from '@/containers/MfaCodeVerification';
import useErrorHandler from '@/hooks/use-error-handler';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useSkipOptionalMfa from '@/hooks/use-skip-optional-mfa';
import IdentifierProfileForm from '@/pages/Continue/IdentifierProfileForm';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

import styles from './index.module.scss';

type Props = {
  readonly identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly titleKey: TFuncKey;
  readonly descriptionKey: TFuncKey;
  readonly invalidInputErrorKey: string;
};

const VerificationCodeMfaBinding = ({
  identifierType,
  titleKey,
  descriptionKey,
  invalidInputErrorKey,
}: Props) => {
  const { t } = useTranslation();
  const mfaFlowState = useMfaFlowState(UserMfaFlow.MfaBinding);
  const { verificationIdsMap, setVerificationId, setIdentifierInputValue } =
    useContext(UserInteractionContext);
  const navigate = useNavigateWithPreservedSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>();

  const skipMfa = useSkipMfa();
  const skipOptionalMfa = useSkipOptionalMfa();
  const handleError = useErrorHandler();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const handleSubmit = useCallback(
    async (_identifier: SignInIdentifier, value: string) => {
      const identifier = { type: identifierType, value };

      try {
        const result = await sendVerificationCode(InteractionEvent.Register, identifier);

        setVerificationId(codeVerificationTypeMap[identifierType], result.verificationId);
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
            setErrorMessage(invalidInputErrorKey);
          },
        });
      }
    },
    [
      handleError,
      identifierType,
      invalidInputErrorKey,
      mfaFlowState,
      navigate,
      setIdentifierInputValue,
      setVerificationId,
    ]
  );

  if (!mfaFlowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { skippable, availableFactors, suggestion, maskedIdentifiers } = mfaFlowState;
  const factor =
    identifierType === SignInIdentifier.Email
      ? MfaFactor.EmailVerificationCode
      : MfaFactor.PhoneVerificationCode;
  const maskedIdentifier = maskedIdentifiers?.[factor];
  const onSkip = conditional(skippable && (suggestion ? skipOptionalMfa : skipMfa));

  if (maskedIdentifier) {
    const verificationId = verificationIdsMap[codeVerificationTypeMap[identifierType]];

    if (!verificationId) {
      return <ErrorPage title="error.invalid_session" rawMessage="Verification ID not found" />;
    }

    return (
      <SecondaryPageLayout
        title={`description.verify_${identifierType}`}
        description="description.enter_passcode"
        descriptionProps={{
          address: t(
            `description.${identifierType === SignInIdentifier.Email ? 'email' : 'phone_number'}`
          ),
          target: maskedIdentifier,
        }}
        onSkip={onSkip}
      >
        <MfaCodeVerification
          identifierType={identifierType}
          verificationId={verificationId}
          verifyCode={bindMfaByVerificationCode}
          resendCode={sendSubjectBindMfaVerificationCode}
        />
        {availableFactors.length > 1 && (
          <SwitchMfaFactorsLink
            flow={UserMfaFlow.MfaBinding}
            flowState={mfaFlowState}
            className={styles.switchLink}
          />
        )}
      </SecondaryPageLayout>
    );
  }

  return (
    <SecondaryPageLayout title={titleKey} description={descriptionKey} onSkip={onSkip}>
      <IdentifierProfileForm
        autoFocus
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        defaultType={identifierType}
        enabledTypes={[identifierType]}
        onSubmit={handleSubmit}
      />
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink
          flow={UserMfaFlow.MfaBinding}
          flowState={mfaFlowState}
          className={styles.switchLink}
        />
      )}
    </SecondaryPageLayout>
  );
};

export default VerificationCodeMfaBinding;
