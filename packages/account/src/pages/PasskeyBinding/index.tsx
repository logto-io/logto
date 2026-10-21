import Button from '@experience/shared/components/Button';
import InputField from '@experience/shared/components/InputFields/InputField';
import { AccountCenterControlValue, MfaFactor } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { browserSupportsWebAuthn, startRegistration, WebAuthnError } from '@simplewebauthn/browser';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UAParser as parseUa } from 'ua-parser-js';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createWebAuthnRegistration,
  verifyWebAuthnRegistration,
  addWebAuthnMfa,
} from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import StepUpEntryFallback from '@ac/components/StepUpEntryFallback';
import { passkeySuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useStepUpEntry } from '@ac/hooks/use-step-up';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { isWebAuthnConfigurable } from '@ac/utils/security-page';

import styles from './index.module.scss';

const PasskeyBinding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, experienceSettings, setToast } = useContext(PageContext);
  const createRegistrationRequest = useApi(createWebAuthnRegistration, { silent: true });
  const verifyRegistrationRequest = useApi(verifyWebAuthnRegistration);
  const addWebAuthnRequest = useApi(addWebAuthnMfa);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();
  const isPageEnabled =
    Boolean(accountCenterSettings?.enabled) &&
    (accountCenterSettings?.fields.passkey ?? accountCenterSettings?.fields.mfa) ===
      AccountCenterControlValue.Edit &&
    isWebAuthnConfigurable(experienceSettings);
  const { isReady, hasFailed } = useStepUpEntry({ enabled: isPageEnabled });

  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState<boolean>();
  // Pre-fetched WebAuthn registration options to ensure startRegistration() is called
  // synchronously in the click handler (required for iOS Safari/WKWebView user gesture)
  const [registrationData, setRegistrationData] = useState<{
    verificationRecordId: string;
    registrationOptions: Parameters<typeof startRegistration>[0];
  }>();
  // State for the naming step
  const [webAuthnVerificationRecordId, setWebAuthnVerificationRecordId] = useState<string>();
  const [passkeyName, setPasskeyName] = useState<string>('');

  // Generate default passkey name from user-agent
  const defaultPasskeyName = useMemo(() => {
    const { browser, os } = parseUa(navigator.userAgent);
    if (browser.name && os.name) {
      return `${browser.name} on ${os.name}`;
    }
    return '';
  }, []);

  // Check WebAuthn browser support on mount
  useEffect(() => {
    setIsWebAuthnSupported(browserSupportsWebAuthn());
  }, []);

  // Pre-fetch WebAuthn registration options when the authentication context is ready.
  // This ensures startRegistration() can be called synchronously in the click handler.
  useEffect(() => {
    const fetchRegistrationOptions = async () => {
      if (!isReady) {
        return;
      }

      const [error, response] = await createRegistrationRequest();

      if (error || !response) {
        return;
      }

      setRegistrationData({
        verificationRecordId: response.verificationRecordId,
        registrationOptions: response.registrationOptions,
      });
    };

    void fetchRegistrationOptions();
  }, [isReady, createRegistrationRequest]);

  const handleAddPasskey = useCallback(async () => {
    if (!isReady || loading || !registrationData) {
      return;
    }

    const { verificationRecordId: webAuthnVerificationId, registrationOptions } = registrationData;

    // Step 1: Call WebAuthn browser API synchronously after click (required for iOS Safari)
    // Registration options were pre-fetched to avoid async operations before this call
    const credential = await trySafe(
      async () => startRegistration(registrationOptions),
      (error) => {
        // User cancelled the WebAuthn dialog, no need to show error
        if (
          (error instanceof DOMException || error instanceof Error) &&
          error.name === 'NotAllowedError'
        ) {
          return;
        }

        if (error instanceof WebAuthnError) {
          switch (error.code) {
            case 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED': {
              setToast(t('account_center.mfa.passkey_already_registered'));
              return;
            }
            case 'ERROR_CEREMONY_ABORTED': {
              // User cancelled the operation, no need to show error
              return;
            }
            default: {
              break;
            }
          }
        }

        console.error('WebAuthn registration failed:', error);
        setToast(t('mfa.webauthn_failed_to_create'));
      }
    );

    if (!credential) {
      return;
    }

    // Step 2: Verify registration with server
    const [verifyError, verifyResponse] = await verifyRegistrationRequest(webAuthnVerificationId, {
      ...credential,
      type: MfaFactor.WebAuthn,
    });

    if (verifyError) {
      await handleError(verifyError);
      return;
    }

    if (!verifyResponse) {
      return;
    }

    // Step 3: Show naming step instead of directly adding the MFA
    setWebAuthnVerificationRecordId(verifyResponse.verificationRecordId);
    setPasskeyName(defaultPasskeyName);
  }, [
    defaultPasskeyName,
    handleError,
    loading,
    registrationData,
    isReady,
    setToast,
    t,
    verifyRegistrationRequest,
  ]);

  const handleSubmitName = useCallback(async () => {
    if (!isReady || !webAuthnVerificationRecordId || loading) {
      return;
    }

    // Add WebAuthn MFA to user with the custom name
    const [addError] = await addWebAuthnRequest({
      newIdentifierVerificationRecordId: webAuthnVerificationRecordId,
      name: passkeyName.trim() || undefined,
    });

    if (addError) {
      if (await requestStepUp(addError, { type: 'enter-subpage' })) {
        return;
      }

      await handleError(addError);
      return;
    }

    navigate(passkeySuccessRoute, { replace: true });
  }, [
    addWebAuthnRequest,
    handleError,
    isReady,
    loading,
    navigate,
    passkeyName,
    requestStepUp,
    webAuthnVerificationRecordId,
  ]);

  if (
    !accountCenterSettings?.enabled ||
    (accountCenterSettings.fields.passkey ?? accountCenterSettings.fields.mfa) !==
      AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isWebAuthnConfigurable(experienceSettings)) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.passkey_not_enabled"
      />
    );
  }

  if (isWebAuthnSupported === false) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="mfa.webauthn_not_supported" />
    );
  }

  if (!isReady) {
    return <StepUpEntryFallback hasFailed={hasFailed} />;
  }

  // Show naming step after WebAuthn registration is verified
  if (webAuthnVerificationRecordId) {
    return (
      <SecondaryPageLayout
        title="account_center.passkey.name_this_passkey"
        description="account_center.passkey.name_passkey_description"
      >
        <div className={styles.container}>
          <InputField
            name="passkeyName"
            label={t('account_center.passkey.name_input_label')}
            value={passkeyName}
            onChange={({ currentTarget }) => {
              setPasskeyName(currentTarget.value);
            }}
          />
          <Button
            title="action.continue"
            type="primary"
            className={styles.submitButton}
            isLoading={loading}
            onClick={() => {
              void handleSubmitName();
            }}
          />
        </div>
      </SecondaryPageLayout>
    );
  }

  return (
    <SecondaryPageLayout title="mfa.create_a_passkey" description="mfa.create_passkey_description">
      <div className={styles.container}>
        <Button
          title="action.continue"
          type="primary"
          className={styles.submitButton}
          isLoading={loading}
          isDisabled={!registrationData}
          onClick={() => {
            void handleAddPasskey();
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default PasskeyBinding;
