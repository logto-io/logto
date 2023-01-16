import type { RequestErrorBody } from '@logto/schemas';
import { SignInMode } from '@logto/schemas';
import { useEffect, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { signInWithSocial } from '@/apis/interaction';
import { socialAccountNotExistErrorDataGuard } from '@/types/guard';
import { parseQueryParameters } from '@/utils';
import { stateValidation } from '@/utils/social-connectors';

import type { ErrorHandlers } from './use-api';
import useApi from './use-api';
import { PageContext } from './use-page-context';
import useRequiredProfileErrorHandler from './use-required-profile-error-handler';
import { useSieMethods } from './use-sie';
import useSocialRegister from './use-social-register';

const useSocialSignInListener = (connectorId?: string) => {
  const { setToast } = useContext(PageContext);
  const { signInMode, signUpMethods } = useSieMethods();
  const { t } = useTranslation();

  const navigate = useNavigate();

  const registerWithSocial = useSocialRegister(connectorId);

  const accountNotExistErrorHandler = useCallback(
    async (error: RequestErrorBody) => {
      const [, data] = validate(error.data, socialAccountNotExistErrorDataGuard);
      const { relatedUser } = data ?? {};

      if (!connectorId) {
        return;
      }

      if (relatedUser) {
        navigate(`/social/link/${connectorId}`, {
          replace: true,
          state: { relatedUser },
        });

        return;
      }

      // Register with social
      await registerWithSocial(connectorId);
    },
    [connectorId, navigate, registerWithSocial]
  );

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler();

  const signInWithSocialErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.identity_not_exist': async (error) => {
        // Should not let user register new social account under sign-in only mode
        if (signInMode === SignInMode.SignIn) {
          setToast(error.message);

          return;
        }

        await accountNotExistErrorHandler(error);
      },
      ...requiredProfileErrorHandlers,
    }),
    [requiredProfileErrorHandlers, signInMode, accountNotExistErrorHandler, setToast]
  );

  const { result, run: asyncSignInWithSocial } = useApi(
    signInWithSocial,
    signInWithSocialErrorHandlers
  );

  const signInWithSocialHandler = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      void asyncSignInWithSocial({
        connectorId,
        connectorData: {
          // For validation use only
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
          ...data,
        },
      });
    },
    [asyncSignInWithSocial]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  // Social Sign-In Callback Handler
  useEffect(() => {
    if (!connectorId) {
      return;
    }

    const { state, ...rest } = parseQueryParameters(window.location.search);

    if (!state || !stateValidation(state, connectorId)) {
      setToast(t('error.invalid_connector_auth'));

      return;
    }

    void signInWithSocialHandler(connectorId, rest);
  }, [connectorId, setToast, signInWithSocialHandler, t]);
};

export default useSocialSignInListener;
