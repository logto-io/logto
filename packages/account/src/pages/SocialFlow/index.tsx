import {
  AccountCenterControlValue,
  accountCenterSocialStatePrefix,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createSocialVerification,
  deleteSocialIdentity,
  linkSocialIdentity,
  replaceSocialIdentity,
} from '@ac/apis/social';
import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import StepUpEntryFallback from '@ac/components/StepUpEntryFallback';
import { securityRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useStepUpEntry } from '@ac/hooks/use-step-up';
import { canManageSocialIdentitiesWithoutVerification } from '@ac/utils/security-page';
import { accountStorage, sessionStorage } from '@ac/utils/session-storage';
import { getLocalizedConnectorName } from '@ac/utils/social-connector';
import { finalizeSocialFlowFailure, finalizeSocialFlowSuccess } from '@ac/utils/social-flow';

type Props = {
  readonly mode: 'add' | 'remove' | 'change';
};

const generateState = () =>
  `${accountCenterSocialStatePrefix}${crypto.randomUUID().replaceAll('-', '')}`;

const SocialFlow = ({ mode }: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const { connectorId } = useParams<{ connectorId: string }>();
  const {
    accountCenterSettings,
    experienceSettings,
    refreshUserInfo,
    setToast,
    userInfo,
    isLoadingUserInfo,
  } = useContext(PageContext);
  const createSocialVerificationRequest = useApi(createSocialVerification);
  const deleteSocialIdentityRequest = useApi(deleteSocialIdentity);
  const linkSocialIdentityRequest = useApi(linkSocialIdentity);
  const replaceSocialIdentityRequest = useApi(replaceSocialIdentity);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();
  const [startedFlowKey, setStartedFlowKey] = useState<string>();

  const connector = useMemo(
    (): ExperienceSocialConnector | undefined =>
      experienceSettings?.socialConnectors.find(({ id }) => id === connectorId),
    [connectorId, experienceSettings?.socialConnectors]
  );
  const hasLinkedConnector = Boolean(connector && userInfo?.identities?.[connector.target]);
  const duplicateBindingMessage = 'You have already associated this social account.';
  const connectorName = connector ? getLocalizedConnectorName(connector, language) : undefined;
  const storedSocialFlow = connectorId ? accountStorage.socialFlow.get(connectorId) : undefined;
  const canSkipVerification = canManageSocialIdentitiesWithoutVerification(userInfo);
  const isPageEnabled =
    Boolean(accountCenterSettings?.enabled) &&
    accountCenterSettings?.fields.social === AccountCenterControlValue.Edit;
  const isStepUpEntryEnabled =
    isPageEnabled &&
    Boolean(experienceSettings) &&
    Boolean(connectorId) &&
    Boolean(connector) &&
    Boolean(userInfo);
  const { isReady, hasFailed } = useStepUpEntry({
    enabled: isStepUpEntryEnabled,
    skip: canSkipVerification,
  });
  const isIdentityVerificationReady = isReady;
  const flowKey = isIdentityVerificationReady && connectorId ? `${mode}:${connectorId}` : undefined;

  const handleProtectedError = useCallback(
    async (error: unknown) => requestStepUp(error, { type: 'enter-subpage' }),
    [requestStepUp]
  );

  const handleFlowError = useCallback(
    async (error: unknown) => {
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
            clearFlowRecord: true,
            message: requestError.message,
            setToast,
            navigate,
          });
        },
      });
    },
    [connectorId, handleError, navigate, setToast]
  );

  const handleLinkSuccess = useCallback(async () => {
    if (!connectorId || !connector || !connectorName) {
      return;
    }

    await finalizeSocialFlowSuccess({
      connectorId,
      refreshUserInfo,
      navigate,
    });
  }, [connector, connectorId, connectorName, navigate, refreshUserInfo]);

  const handleRemoveSuccess = useCallback(async () => {
    if (!connectorId) {
      return;
    }

    await finalizeSocialFlowSuccess({
      connectorId,
      refreshUserInfo,
      navigate,
    });
  }, [connectorId, navigate, refreshUserInfo]);

  useEffect(() => {
    if (!isIdentityVerificationReady) {
      if (startedFlowKey) {
        setStartedFlowKey(undefined);
      }

      return;
    }

    if (mode === 'add' && hasLinkedConnector) {
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
      if (storedSocialFlow?.status === 'verified') {
        const [error] = await linkSocialIdentityRequest(storedSocialFlow.verificationRecordId);

        if (error) {
          if (await handleProtectedError(error)) {
            return;
          }

          await handleFlowError(error);
          return;
        }

        await handleLinkSuccess();
        return;
      }

      const state = generateState();
      const redirectUri = `${window.location.origin}/callback/${connectorId}`;
      const [error, result] = await createSocialVerificationRequest({
        connectorId,
        state,
        redirectUri,
      });

      if (error || !result) {
        await handleFlowError(error);
        return;
      }

      accountStorage.socialFlow.setPending(connectorId, {
        verificationRecordId: result.verificationRecordId,
        expiresAt: result.expiresAt,
        state,
        mode: 'add',
      });

      sessionStorage.clearRouteRestore();
      window.location.assign(result.authorizationUri);
    };

    const startRemoveFlow = async () => {
      const [error] = await deleteSocialIdentityRequest(connector.target);

      if (error) {
        if (await handleProtectedError(error)) {
          return;
        }

        await handleFlowError(error);
        return;
      }

      await handleRemoveSuccess();
    };

    const startChangeFlow = async () => {
      // Post-callback phase: replace the social identity
      if (storedSocialFlow?.status === 'verified') {
        const [error] = await replaceSocialIdentityRequest(storedSocialFlow.verificationRecordId);

        if (error) {
          if (await handleProtectedError(error)) {
            return;
          }

          await handleFlowError(error);
          return;
        }

        await handleLinkSuccess();
        return;
      }

      // Pre-OAuth phase: start add flow to replace existing identity
      const state = generateState();
      const redirectUri = `${window.location.origin}/callback/${connectorId}`;
      const [error, result] = await createSocialVerificationRequest({
        connectorId,
        state,
        redirectUri,
      });

      if (error || !result) {
        await handleFlowError(error);
        return;
      }

      accountStorage.socialFlow.setPending(connectorId, {
        verificationRecordId: result.verificationRecordId,
        expiresAt: result.expiresAt,
        state,
        mode: 'change',
      });

      sessionStorage.clearRouteRestore();
      window.location.assign(result.authorizationUri);
    };

    void (mode === 'add'
      ? startAddFlow()
      : mode === 'remove'
        ? startRemoveFlow()
        : startChangeFlow());
  }, [
    connector,
    connectorId,
    connectorName,
    createSocialVerificationRequest,
    deleteSocialIdentityRequest,
    handleFlowError,
    handleLinkSuccess,
    handleProtectedError,
    handleRemoveSuccess,
    hasLinkedConnector,
    linkSocialIdentityRequest,
    replaceSocialIdentityRequest,
    mode,
    flowKey,
    startedFlowKey,
    isIdentityVerificationReady,
    storedSocialFlow,
  ]);

  if (!isPageEnabled) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!experienceSettings) {
    return <GlobalLoading />;
  }

  if (!connectorId || !connector) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.social.not_enabled"
      />
    );
  }

  if (isLoadingUserInfo || userInfo === undefined) {
    return <GlobalLoading />;
  }

  if (!isReady) {
    return <StepUpEntryFallback hasFailed={hasFailed} />;
  }

  if (mode === 'add' && hasLinkedConnector) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        rawMessage={duplicateBindingMessage}
        action={{
          titleKey: 'action.back',
          onClick: () => {
            navigate(securityRoute, { replace: true });
          },
        }}
      />
    );
  }

  return <GlobalLoading />;
};

export default SocialFlow;
