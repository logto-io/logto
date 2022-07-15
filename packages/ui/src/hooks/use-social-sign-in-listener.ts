import { useEffect, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { signInWithSocial } from '@/apis/social';
import { parseQueryParameters } from '@/utils';
import { stateValidation } from '@/utils/social-connectors';

import useApi, { ErrorHandlers } from './use-api';
import { PageContext } from './use-page-context';

const useSocialSignInListener = () => {
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation();
  const parameters = useParams();
  const navigate = useNavigate();

  const signInWithSocialErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.identity_not_exists': (error) => {
        if (parameters.connector) {
          navigate(`/social/register/${parameters.connector}`, {
            replace: true,
            state: error.data,
          });
        }
      },
    }),
    [navigate, parameters.connector]
  );

  const { result, run: asyncSignInWithSocial } = useApi(
    signInWithSocial,
    signInWithSocialErrorHandlers
  );

  const signInWithSocialHandler = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      void asyncSignInWithSocial({
        connectorId,
        data: {
          redirectUri: `${window.location.origin}/callback/${connectorId}`, // For validation use only
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
    if (!parameters.connector) {
      return;
    }

    const { state, ...rest } = parseQueryParameters(window.location.search);

    if (!state || !stateValidation(state, parameters.connector)) {
      setToast(t('error.invalid_connector_auth'));

      return;
    }

    void signInWithSocialHandler(parameters.connector, rest);
  }, [parameters.connector, setToast, signInWithSocialHandler, t]);
};

export default useSocialSignInListener;
