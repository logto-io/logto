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
import { finalizeSocialFlowFailure, finalizeSocialFlowSuccess } from '@ac/utils/social-flow';

const SocialCallback = () => {
  const {
    t,
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
    setToast(t('account_center.verification.verification_required'));
    navigate(getSocialAddRoute(connectorId), { replace: true });
  }, [connectorId, navigate, setToast, setVerificationId, t]);

  const finishLinkFlow = useCallback(async () => {
    if (!connectorId || !connectorName) {
      return;
    }

    await finalizeSocialFlowSuccess({
      connectorId,
      successMessage: t('account_center.social.linked', {
        connector: connectorName,
        defaultValue: '',
      }),
      refreshUserInfo,
      setToast,
      navigate,
    });
  }, [connectorId, connectorName, navigate, refreshUserInfo, setToast, t]);

  useEffect(() => {
    if (!connectorId || !connector || startedConnectorId === connectorId) {
      return;
    }

    if (!verificationId) {
      return;
    }

    setStartedConnectorId(connectorId);

    const storedSocialFlow = accountStorage.socialFlow.get(connectorId);

    if (storedSocialFlow?.status !== 'pending') {
      finalizeSocialFlowFailure({
        connectorId,
        clearFlowRecord: true,
        message: t('error.invalid_session'),
        setToast,
        navigate,
      });
      return;
    }

    if (storedSocialFlow.state !== (searchParameters.get('state') ?? undefined)) {
      finalizeSocialFlowFailure({
        connectorId,
        clearFlowRecord: true,
        message: t('error.invalid_connector_auth'),
        setToast,
        navigate,
      });
      return;
    }

    const handleCallbackError = async (error: unknown, clearPendingVerification = true) => {
      await handleError(error, {
        'verification_record.permission_denied': redirectToReverify,
        global: async (requestError) => {
          finalizeSocialFlowFailure({
            connectorId,
            clearFlowRecord: clearPendingVerification,
            message: requestError.message,
            setToast,
            navigate,
          });
        },
      });
    };

    const completeCallback = async () => {
      const [verifyError] = await verifySocialVerificationRequest({
        verificationRecordId: storedSocialFlow.verificationRecordId,
        connectorData: Object.fromEntries(searchParameters.entries()),
      });

      if (verifyError) {
        await handleCallbackError(verifyError);
        return;
      }

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: storedSocialFlow.verificationRecordId,
        expiresAt: storedSocialFlow.expiresAt,
      });

      const [linkError] = await linkSocialIdentityRequest(
        verificationId,
        storedSocialFlow.verificationRecordId
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
    t,
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
