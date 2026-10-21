import { AccountCenterControlValue, type ExperienceSocialConnector } from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  linkSocialIdentity,
  replaceSocialIdentity,
  verifySocialVerification,
} from '@ac/apis/social';
import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import { getSocialAddRoute, getSocialChangeRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp from '@ac/hooks/use-step-up';
import { accountCenterBasePath } from '@ac/utils/account-center-route';
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
    isLoadingExperience,
    refreshUserInfo,
    setToast,
  } = useContext(PageContext);
  const verifySocialVerificationRequest = useApi(verifySocialVerification);
  const linkSocialIdentityRequest = useApi(linkSocialIdentity);
  const replaceSocialIdentityRequest = useApi(replaceSocialIdentity);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();
  const [startedConnectorId, setStartedConnectorId] = useState<string>();

  const connector = useMemo(
    (): ExperienceSocialConnector | undefined =>
      experienceSettings?.socialConnectors.find(({ id }) => id === connectorId),
    [connectorId, experienceSettings?.socialConnectors]
  );
  const connectorName = connector ? getLocalizedConnectorName(connector, language) : undefined;
  const storedSocialFlow = connectorId ? accountStorage.socialFlow.get(connectorId) : undefined;

  const finishLinkFlow = useCallback(async () => {
    if (!connectorId || !connectorName) {
      return;
    }

    await finalizeSocialFlowSuccess({
      connectorId,
      refreshUserInfo,
      navigate,
    });
  }, [connectorId, connectorName, navigate, refreshUserInfo]);

  useEffect(() => {
    if (
      !accountCenterSettings?.enabled ||
      accountCenterSettings.fields.social !== AccountCenterControlValue.Edit ||
      !experienceSettings ||
      !connectorId ||
      !connector ||
      startedConnectorId === connectorId
    ) {
      return;
    }

    setStartedConnectorId(connectorId);

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
        'user.social_account_exists_in_profile': async (requestError) => {
          finalizeSocialFlowFailure({
            connectorId,
            clearFlowRecord: true,
            message: requestError.message,
            setToast,
            navigate,
          });
        },
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
      const redirectUri = `${window.location.origin}/callback/${connectorId}`;
      const [verifyError] = await verifySocialVerificationRequest({
        verificationRecordId: storedSocialFlow.verificationRecordId,
        connectorData: {
          ...Object.fromEntries(searchParameters.entries()),
          redirectUri,
        },
      });

      if (verifyError) {
        await handleCallbackError(verifyError);
        return;
      }

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: storedSocialFlow.verificationRecordId,
        expiresAt: storedSocialFlow.expiresAt,
        mode: storedSocialFlow.mode,
      });

      // The pending step-up stores an Account Center pathname, including the base path, so the
      // callback can restore the social subpage.
      const route =
        storedSocialFlow.mode === 'change'
          ? `${accountCenterBasePath}${getSocialChangeRoute(connectorId)}`
          : `${accountCenterBasePath}${getSocialAddRoute(connectorId)}`;

      if (storedSocialFlow.mode === 'change') {
        const [error] = await replaceSocialIdentityRequest(storedSocialFlow.verificationRecordId);

        if (error) {
          if (await requestStepUp(error, { type: 'enter-subpage' }, { route })) {
            return;
          }

          await handleCallbackError(error);
          return;
        }
      } else {
        const [error] = await linkSocialIdentityRequest(storedSocialFlow.verificationRecordId);

        if (error) {
          if (await requestStepUp(error, { type: 'enter-subpage' }, { route })) {
            return;
          }

          await handleCallbackError(error, false);
          return;
        }
      }

      await finishLinkFlow();
    };

    void completeCallback();
  }, [
    accountCenterSettings,
    connector,
    connectorId,
    experienceSettings,
    finishLinkFlow,
    handleError,
    linkSocialIdentityRequest,
    replaceSocialIdentityRequest,
    navigate,
    requestStepUp,
    searchParameters,
    setToast,
    startedConnectorId,
    storedSocialFlow,
    verifySocialVerificationRequest,
    t,
  ]);

  if (isLoadingExperience) {
    return <GlobalLoading />;
  }

  if (!accountCenterSettings || !experienceSettings) {
    return <ErrorPage titleKey="error.something_went_wrong" />;
  }

  if (
    !accountCenterSettings.enabled ||
    accountCenterSettings.fields.social !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!connectorId || !connector) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.social.not_enabled"
      />
    );
  }

  return <GlobalLoading />;
};

export default SocialCallback;
