import { AccountCenterControlValue, type ExperienceSocialConnector } from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { linkSocialIdentity, verifySocialVerification } from '@ac/apis/social';
import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import { getSocialAddRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { accountStorage } from '@ac/utils/session-storage';
import { getLocalizedConnectorName } from '@ac/utils/social-connector';

const SocialCallback = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const { connectorId } = useParams<{ connectorId: string }>();
  const {
    accountCenterSettings,
    experienceSettings,
    refreshUserInfo,
    setToast,
    verificationId,
    setVerificationId,
  } = useContext(PageContext);
  const verifySocialVerificationRequest = useApi(verifySocialVerification);
  const linkSocialIdentityRequest = useApi(linkSocialIdentity);
  const handleError = useErrorHandler();
  const [startedConnectorId, setStartedConnectorId] = useState<string>();

  const connector = useMemo(
    (): ExperienceSocialConnector | undefined =>
      experienceSettings?.socialConnectors.find(({ id }) => id === connectorId),
    [connectorId, experienceSettings?.socialConnectors]
  );
  const connectorName = connector ? getLocalizedConnectorName(connector, language) : undefined;

  const redirectToReverify = useCallback(() => {
    if (!connectorId) {
      return;
    }

    setStartedConnectorId(undefined);
    setVerificationId(undefined);
    setToast('Verification expired. Please verify your identity again.');
    navigate(getSocialAddRoute(connectorId), { replace: true });
  }, [connectorId, navigate, setToast, setVerificationId]);

  const finishLinkFlow = useCallback(async () => {
    if (!connectorId || !connectorName) {
      return;
    }

    accountStorage.socialVerification.clear(connectorId);
    await refreshUserInfo();
    setToast(`${connectorName} linked successfully.`);
    navigate('/', { replace: true });
  }, [connectorId, connectorName, navigate, refreshUserInfo, setToast]);

  useEffect(() => {
    if (!connectorId || !connector || startedConnectorId === connectorId) {
      return;
    }

    setStartedConnectorId(connectorId);

    const storedSocialVerification = accountStorage.socialVerification.get(connectorId);

    if (!storedSocialVerification?.state) {
      setToast('Invalid session. Please try again.');
      navigate('/', { replace: true });
      return;
    }

    if (storedSocialVerification.state !== (searchParameters.get('state') ?? undefined)) {
      accountStorage.socialVerification.clear(connectorId);
      setToast('Invalid social sign-in response. Please try again.');
      navigate('/', { replace: true });
      return;
    }

    const handleCallbackError = async (error: unknown, clearPendingVerification = true) => {
      await handleError(error, {
        'verification_record.permission_denied': redirectToReverify,
        global: async (requestError) => {
          if (clearPendingVerification) {
            accountStorage.socialVerification.clear(connectorId);
          }

          setToast(requestError.message);
          navigate('/', { replace: true });
        },
      });
    };

    const completeCallback = async () => {
      const [verifyError] = await verifySocialVerificationRequest({
        verificationRecordId: storedSocialVerification.verificationRecordId,
        connectorData: Object.fromEntries(searchParameters.entries()),
      });

      if (verifyError) {
        await handleCallbackError(verifyError);
        return;
      }

      accountStorage.socialVerification.set(connectorId, {
        verificationRecordId: storedSocialVerification.verificationRecordId,
        expiresAt: storedSocialVerification.expiresAt,
        isVerified: true,
      });

      if (!verificationId) {
        redirectToReverify();
        return;
      }

      const [linkError] = await linkSocialIdentityRequest(
        verificationId,
        storedSocialVerification.verificationRecordId
      );

      if (linkError) {
        await handleCallbackError(linkError, false);
        return;
      }

      await finishLinkFlow();
    };

    void completeCallback();
  }, [
    connector,
    connectorId,
    finishLinkFlow,
    handleError,
    linkSocialIdentityRequest,
    navigate,
    redirectToReverify,
    searchParameters,
    setToast,
    startedConnectorId,
    verificationId,
    verifySocialVerificationRequest,
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

  return <GlobalLoading />;
};

export default SocialCallback;
