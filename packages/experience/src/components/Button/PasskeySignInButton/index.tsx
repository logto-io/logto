import { InteractionEvent } from '@logto/schemas';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedLoader } from 'use-debounced-loader';

import WebAuthnContext from '@/Providers/WebAuthnContextProvider/WebAuthnContext';
import PasskeyIcon from '@/assets/icons/passkey-icon.svg?react';
import usePasskeySignIn from '@/hooks/use-passkey-sign-in';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import RotatingRingIcon from '@/shared/components/Button/RotatingRingIcon';
import buttonStyles from '@/shared/components/Button/index.module.scss';

import styles from './index.module.scss';

const PasskeySignInButton = () => {
  const { t } = useTranslation();
  const {
    authenticationOptions,
    isLoading: isPreparing,
    markAuthenticationOptionsConsumed,
    abortConditionalUI,
  } = useContext(WebAuthnContext);
  const { handleVerifyPasskey } = usePasskeySignIn();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoadingActive = useDebouncedLoader(isPreparing || isSubmitting, 300);
  const isDisabled = isPreparing || !authenticationOptions;

  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const onPasskeySignIn = useCallback(async () => {
    if (!authenticationOptions) {
      return;
    }
    // Abort any pending conditional UI request before starting manual passkey sign-in
    // to prevent `OperationError: A request is already pending`.
    abortConditionalUI();
    setIsSubmitting(true);
    try {
      await handleVerifyPasskey(authenticationOptions, preSignInErrorHandler);
    } finally {
      markAuthenticationOptionsConsumed();
      setIsSubmitting(false);
    }
  }, [
    abortConditionalUI,
    authenticationOptions,
    handleVerifyPasskey,
    markAuthenticationOptionsConsumed,
    preSignInErrorHandler,
  ]);

  if (!browserSupportsWebAuthn()) {
    return null;
  }

  return (
    <button
      disabled={isDisabled}
      className={classNames(
        buttonStyles.button,
        buttonStyles.secondary,
        buttonStyles.large,
        styles.button,
        isDisabled && buttonStyles.disabled
      )}
      type="button"
      onClick={onPasskeySignIn}
    >
      {!isLoadingActive && <PasskeyIcon />}
      {isLoadingActive && (
        <span className={styles.loadingIcon}>
          <RotatingRingIcon />
        </span>
      )}
      <div className={styles.name}>
        <div className={styles.placeHolder} />
        <span>{t('action.sign_in_with', { name: t('mfa.webauthn') })}</span>
        <div className={styles.placeHolder} />
      </div>
    </button>
  );
};

export default PasskeySignInButton;
