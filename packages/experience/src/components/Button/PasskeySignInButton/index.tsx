import { InteractionEvent } from '@logto/schemas';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedLoader } from 'use-debounced-loader';

import WebAuthnContext from '@/Providers/WebAuthnContextProvider/WebAuthnContext';
import { initInteraction } from '@/apis/experience';
import PasskeyIcon from '@/assets/icons/passkey-icon.svg?react';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import RotatingRingIcon from '@/shared/components/Button/RotatingRingIcon';
import buttonStyles from '@/shared/components/Button/index.module.scss';

import styles from './index.module.scss';

const PasskeySignInButton = () => {
  const { t } = useTranslation();
  const { authenticationOptionsResult, isLoading: isPreparing } = useContext(WebAuthnContext);
  const handleWebAuthn = useWebAuthnOperation(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoadingActive = useDebouncedLoader(isPreparing || isSubmitting, 300);
  const isDisabled = isPreparing && !authenticationOptionsResult;

  const onPasskeySignIn = useCallback(async () => {
    if (!authenticationOptionsResult) {
      return;
    }
    const { options, verificationId } = authenticationOptionsResult;

    setIsSubmitting(true);
    await initInteraction(InteractionEvent.SignIn);
    await handleWebAuthn(options, verificationId);
    setIsSubmitting(false);
  }, [handleWebAuthn, authenticationOptionsResult]);

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
