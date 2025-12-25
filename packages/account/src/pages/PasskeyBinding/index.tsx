import Button from '@experience/shared/components/Button';
import { AccountCenterControlValue, MfaFactor, type Mfa } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createWebAuthnRegistration,
  verifyWebAuthnRegistration,
  addWebAuthnMfa,
  getMfaVerifications,
} from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { backupCodesGenerateRoute, passkeySuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const isWebAuthnEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.WebAuthn) ?? false;
const isBackupCodeEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.BackupCode) ?? false;

const PasskeyBinding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, experienceSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications);
  const createRegistrationRequest = useApi(createWebAuthnRegistration);
  const verifyRegistrationRequest = useApi(verifyWebAuthnRegistration);
  const addWebAuthnRequest = useApi(addWebAuthnMfa);
  const handleError = useErrorHandler();

  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState<boolean>();
  const [hasBackupCodes, setHasBackupCodes] = useState<boolean>();
  // Pre-fetched WebAuthn registration options to ensure startRegistration() is called
  // synchronously in the click handler (required for iOS Safari/WKWebView user gesture)
  const [registrationData, setRegistrationData] = useState<{
    verificationRecordId: string;
    registrationOptions: Parameters<typeof startRegistration>[0];
  }>();

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

  // Check if user has backup codes
  useEffect(() => {
    const checkExistingMfa = async () => {
      const [error, result] = await getMfaRequest();

      if (error) {
        setHasBackupCodes(false);
        return;
      }

      const hasBackup = result?.some((mfa) => mfa.type === MfaFactor.BackupCode) ?? false;
      setHasBackupCodes(hasBackup);
    };

    void checkExistingMfa();
  }, [getMfaRequest]);

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

    // Step 3: Add WebAuthn MFA to user
    const [addError] = await addWebAuthnRequest(verificationId, {
      newIdentifierVerificationRecordId: verifyResponse.verificationRecordId,
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

    // Step 4: Navigate to success or backup code setup
    if (isBackupCodeEnabled(experienceSettings?.mfa) && !hasBackupCodes) {
      void navigate(backupCodesGenerateRoute, { replace: true });
      return;
    }

    void navigate(passkeySuccessRoute, { replace: true });
  }, [
    addWebAuthnRequest,
    experienceSettings?.mfa,
    handleError,
    hasBackupCodes,
    loading,
    navigate,
    registrationData,
    setToast,
    setVerificationId,
    t,
    verificationId,
    verifyRegistrationRequest,
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

  return (
    <SecondaryPageLayout title="mfa.create_a_passkey" description="mfa.create_passkey_description">
      <div className={styles.container}>
        <Button
          title="action.continue"
          type="primary"
          className={styles.submitButton}
          isLoading={loading || !registrationData}
          onClick={() => {
            void handleAddPasskey();
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default PasskeyBinding;
