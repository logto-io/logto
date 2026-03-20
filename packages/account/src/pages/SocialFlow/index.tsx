import { AccountCenterControlValue, type ExperienceSocialConnector } from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createSocialVerification,
  deleteSocialIdentity,
  linkSocialIdentity,
} from '@ac/apis/social';
import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { getSocialCallbackRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { accountCenterBasePath } from '@ac/utils/account-center-route';
import { accountStorage } from '@ac/utils/session-storage';
import { getLocalizedConnectorName } from '@ac/utils/social-connector';

type Props = {
  readonly mode: 'add' | 'remove';
};

const generateState = () => crypto.randomUUID().replaceAll('-', '');

const SocialFlow = ({ mode }: Props) => {
  const {
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const { connectorId } = useParams<{ connectorId: string }>();
  const {
    accountCenterSettings,
    experienceSettings,
    refreshUserInfo,
    setToast,
    verificationId,
    setVerificationId,
  } = useContext(PageContext);
  const createSocialVerificationRequest = useApi(createSocialVerification);
  const deleteSocialIdentityRequest = useApi(deleteSocialIdentity);
  const linkSocialIdentityRequest = useApi(linkSocialIdentity);
  const handleError = useErrorHandler();
  const [startedFlowKey, setStartedFlowKey] = useState<string>();

  const connector = useMemo(
    (): ExperienceSocialConnector | undefined =>
      experienceSettings?.socialConnectors.find(({ id }) => id === connectorId),
    [connectorId, experienceSettings?.socialConnectors]
  );
  const connectorName = connector ? getLocalizedConnectorName(connector, language) : undefined;
  const storedSocialVerification = connectorId
    ? accountStorage.socialVerification.get(connectorId)
    : undefined;
  const flowKey =
    verificationId && connectorId ? `${mode}:${connectorId}:${verificationId}` : undefined;

  const resetVerification = useCallback(() => {
    setStartedFlowKey(undefined);
    setVerificationId(undefined);
    setToast('Verification expired. Please verify your identity again.');
  }, [setToast, setVerificationId]);

  const navigateToSecurity = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  const handleFlowError = useCallback(
    async (error: unknown) => {
      await handleError(error, {
        'verification_record.permission_denied': resetVerification,
        global: async (requestError) => {
          setToast(requestError.message);
          navigateToSecurity();
        },
      });
    },
    [handleError, navigateToSecurity, resetVerification, setToast]
  );

  const handleLinkSuccess = useCallback(async () => {
    if (!connectorId || !connector || !connectorName) {
      return;
    }

    accountStorage.socialVerification.clear(connectorId);
    await refreshUserInfo();
    setToast(`${connectorName} linked successfully.`);
    navigateToSecurity();
  }, [connector, connectorId, connectorName, navigateToSecurity, refreshUserInfo, setToast]);

  const handleRemoveSuccess = useCallback(async () => {
    if (!connectorName) {
      return;
    }

    await refreshUserInfo();
    setToast(`${connectorName} removed successfully.`);
    navigateToSecurity();
  }, [connectorName, navigateToSecurity, refreshUserInfo, setToast]);

  useEffect(() => {
    if (!verificationId) {
      if (startedFlowKey) {
        setStartedFlowKey(undefined);
      }

      return;
    }

    if (!connectorId || !connector || !flowKey || startedFlowKey === flowKey) {
      return;
    }

    setStartedFlowKey(flowKey);

    const startAddFlow = async () => {
      if (storedSocialVerification?.isVerified) {
        const [error] = await linkSocialIdentityRequest(
          verificationId,
          storedSocialVerification.verificationRecordId
        );

        if (error) {
          await handleFlowError(error);
          return;
        }

        await handleLinkSuccess();
        return;
      }

      const state = generateState();
      const redirectUri = `${window.location.origin}${accountCenterBasePath}${getSocialCallbackRoute(
        connectorId
      )}`;
      const [error, result] = await createSocialVerificationRequest({
        connectorId,
        state,
        redirectUri,
      });

      if (error || !result) {
        await handleFlowError(error);
        return;
      }

      accountStorage.socialVerification.set(connectorId, {
        verificationRecordId: result.verificationRecordId,
        expiresAt: result.expiresAt,
        state,
      });

      window.location.assign(result.authorizationUri);
    };

    const startRemoveFlow = async () => {
      const [error] = await deleteSocialIdentityRequest(verificationId, connector.target);

      if (error) {
        await handleFlowError(error);
        return;
      }

      await handleRemoveSuccess();
    };

    void (mode === 'add' ? startAddFlow() : startRemoveFlow());
  }, [
    connector,
    connectorId,
    createSocialVerificationRequest,
    deleteSocialIdentityRequest,
    handleFlowError,
    handleLinkSuccess,
    handleRemoveSuccess,
    linkSocialIdentityRequest,
    mode,
    flowKey,
    startedFlowKey,
    storedSocialVerification,
    verificationId,
  ]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.social !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!connectorId || !connector) {
    return <ErrorPage titleKey="error.something_went_wrong" />;
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return <GlobalLoading />;
};

export default SocialFlow;
