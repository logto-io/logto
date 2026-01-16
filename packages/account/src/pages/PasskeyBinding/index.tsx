import Button from '@experience/shared/components/Button';
import InputField from '@experience/shared/components/InputFields/InputField';
import { AccountCenterControlValue, MfaFactor, type Mfa } from '@logto/schemas';
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
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { passkeySuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const isWebAuthnEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.WebAuthn) ?? false;

const PasskeyBinding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, experienceSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const createRegistrationRequest = useApi(createWebAuthnRegistration, { silent: true });
  const verifyRegistrationRequest = useApi(verifyWebAuthnRegistration);
  const addWebAuthnRequest = useApi(addWebAuthnMfa);
  const handleError = useErrorHandler();

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

  // Pre-fetch WebAuthn registration options when verificationId is available
  // This ensures startRegistration() can be called synchronously in the click handler
  useEffect(() => {
    const fetchRegistrationOptions = async () => {
      if (!verificationId) {
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
  }, [verificationId, createRegistrationRequest]);

  const handleAddPasskey = useCallback(async () => {
    if (!verificationId || loading || !registrationData) {
      return;
    }

    const { verificationRecordId: webAuthnVerificationId, registrationOptions } = registrationData;

    // Step 1: Call WebAuthn browser API synchronously after click (required for iOS Safari)
    // Registration options were pre-fetched to avoid async operations before this call
    const credential = await trySafe(
      async () => startRegistration(registrationOptions),
      (error) => {
        console.error('WebAuthn registration failed:', error);

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
    setToast,
    t,
    verificationId,
    verifyRegistrationRequest,
  ]);

  const handleSubmitName = useCallback(async () => {
    if (!verificationId || !webAuthnVerificationRecordId || loading) {
      return;
    }

    // Add WebAuthn MFA to user with the custom name
    const [addError] = await addWebAuthnRequest(verificationId, {
      newIdentifierVerificationRecordId: webAuthnVerificationRecordId,
      name: passkeyName.trim() || undefined,
    });

    if (addError) {
      await handleError(addError, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
      });
      return;
    }

    void navigate(passkeySuccessRoute, { replace: true });
  }, [
    addWebAuthnRequest,
    handleError,
    loading,
    navigate,
    passkeyName,
    setToast,
    setVerificationId,
    t,
    verificationId,
    webAuthnVerificationRecordId,
  ]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.mfa !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isWebAuthnEnabled(experienceSettings?.mfa)) {
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

  if (!verificationId) {
    return <VerificationMethodList />;
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
