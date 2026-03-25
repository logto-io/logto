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
import { accountStorage, sessionStorage } from '@ac/utils/session-storage';
import { getLocalizedConnectorName } from '@ac/utils/social-connector';
import { finalizeSocialFlowFailure, finalizeSocialFlowSuccess } from '@ac/utils/social-flow';

type Props = {
  readonly mode: 'add' | 'remove';
};

const generateState = () => crypto.randomUUID().replaceAll('-', '');

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
  const hasLinkedConnector = Boolean(connector && userInfo?.identities?.[connector.target]);
  const duplicateBindingMessage = 'You have already associated this social account.';
  const connectorName = connector ? getLocalizedConnectorName(connector, language) : undefined;
  const storedSocialFlow = connectorId ? accountStorage.socialFlow.get(connectorId) : undefined;
  const flowKey =
    verificationId && connectorId ? `${mode}:${connectorId}:${verificationId}` : undefined;

  const resetVerification = useCallback(() => {
    setStartedFlowKey(undefined);
    setVerificationId(undefined);
    setToast(t('account_center.verification.verification_required'));
  }, [setToast, setVerificationId, t]);

  const handleFlowError = useCallback(
    async (error: unknown) => {
      await handleError(error, {
        'verification_record.permission_denied': resetVerification,
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
    [connectorId, handleError, navigate, resetVerification, setToast]
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
    if (!connectorId || !connectorName) {
      return;
    }

    await finalizeSocialFlowSuccess({
      connectorId,
      successMessage: t('account_center.social.removed', {
        connector: connectorName,
        defaultValue: '',
      }),
      refreshUserInfo,
      setToast,
      navigate,
    });
  }, [connectorId, connectorName, navigate, refreshUserInfo, setToast, t]);

  useEffect(() => {
    if (!verificationId) {
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
        const [error] = await linkSocialIdentityRequest(
          verificationId,
          storedSocialFlow.verificationRecordId
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

      accountStorage.socialFlow.setPending(connectorId, {
        verificationRecordId: result.verificationRecordId,
        expiresAt: result.expiresAt,
        state,
      });

      sessionStorage.clearRoute();
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
    connectorName,
    createSocialVerificationRequest,
    deleteSocialIdentityRequest,
    handleFlowError,
    handleLinkSuccess,
    handleRemoveSuccess,
    hasLinkedConnector,
    linkSocialIdentityRequest,
    mode,
    flowKey,
    startedFlowKey,
    storedSocialFlow,
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

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  if (mode === 'add' && hasLinkedConnector) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        rawMessage={duplicateBindingMessage}
        action={{
          titleKey: 'action.back',
          onClick: () => {
            navigate('/', { replace: true });
          },
        }}
      />
    );
  }

  return <GlobalLoading />;
};

export default SocialFlow;
