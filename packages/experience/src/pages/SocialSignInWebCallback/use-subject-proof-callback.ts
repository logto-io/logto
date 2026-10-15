import { VerificationType } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { identifyUser, verifySocialVerification, verifySsoVerification } from '@/apis/experience';
import { stepUpRoutes, unknownSessionRoute } from '@/constants/step-up';
import useErrorHandler from '@/hooks/use-error-handler';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useRedirectCallbackValidation from '@/hooks/use-redirect-callback-validation';
import useStepUpErrorHandler from '@/hooks/use-step-up-error-handler';
import useToast from '@/hooks/use-toast';
import { parseQueryParameters } from '@/utils';

/**
 * Handles the social / enterprise SSO OAuth callback when used as upstream subject proof in pure
 * step-up. Verifies the callback payload, asserts the verified identity matches the pinned subject,
 * and returns to the step-up landing to establish a factor; never registers or links an account.
 */
const useSubjectProofCallback = (connectorId: string, type: 'social' | 'sso') => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isConsumed, setIsConsumed] = useState(false);
  const [searchParameters, setSearchParameters] = useSearchParams();
  const { setToast } = useToast();
  const navigate = useNavigateWithPreservedSearchParams();
  const handleError = useErrorHandler();
  const stepUpErrorHandlers = useStepUpErrorHandler();
  const { validateAndRestore } = useRedirectCallbackValidation({
    connectorId,
    flow: type,
    verificationType: type === 'social' ? VerificationType.Social : VerificationType.EnterpriseSso,
  });

  useEffect(() => {
    if (isConsumed) {
      return;
    }

    setIsConsumed(true);
    const { state, ...rest } = parseQueryParameters(searchParameters);
    setSearchParameters({}, { replace: true });

    const result = validateAndRestore(state);

    if (!result.valid) {
      setToast(t(`error.${result.error}`));
      navigate(unknownSessionRoute, { replace: true });
      return;
    }

    const completeSubjectProof = async () => {
      const payload = {
        verificationId: result.verificationId,
        connectorData: {
          ...rest,
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
        },
      };

      try {
        await (type === 'social'
          ? verifySocialVerification(connectorId, payload)
          : verifySsoVerification(connectorId, payload));
        await identifyUser({ verificationId: result.verificationId });
        navigate(stepUpRoutes.landing, { replace: true });
      } catch (error) {
        await handleError(error, {
          ...stepUpErrorHandlers,
          // No account creation or linking fallback is valid for a pinned subject.
          global: () => {
            navigate(unknownSessionRoute, { replace: true });
          },
        });
      } finally {
        setLoading(false);
      }
    };

    void completeSubjectProof();
  }, [
    connectorId,
    handleError,
    isConsumed,
    navigate,
    searchParameters,
    setSearchParameters,
    setToast,
    stepUpErrorHandlers,
    t,
    type,
    validateAndRestore,
  ]);

  return { loading };
};

export default useSubjectProofCallback;
