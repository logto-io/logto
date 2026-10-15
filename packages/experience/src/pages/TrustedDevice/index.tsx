import { InteractionEvent } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { setTrustedDeviceOptInDecision } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import { trustedDeviceOptInStateGuard } from '@/types/guard';

const TrustedDevice = () => {
  const { state } = useLocation();
  const [, optInData] = validate(state, trustedDeviceOptInStateGuard);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const asyncSetDecision = useApi(setTrustedDeviceOptInDecision);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const submitErrorHandlers = useSubmitInteractionErrorHandler(
    optInData?.interactionEvent ?? InteractionEvent.SignIn,
    { replace: true }
  );

  const handleDecision = useCallback(
    async (trusted: boolean) => {
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      const [error, result] = await asyncSetDecision(trusted);

      if (error) {
        await handleError(error, submitErrorHandlers);
        setIsSubmitting(false);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }

      setIsSubmitting(false);
    },
    [asyncSetDecision, handleError, isSubmitting, redirectTo, submitErrorHandlers]
  );

  if (!optInData) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { durationDays } = optInData;

  return (
    <SecondaryPageLayout
      title="mfa.trust_this_device_title"
      description="mfa.trust_this_device_description"
      onSkip={() => {
        void handleDecision(false);
      }}
    >
      <Button
        title="mfa.trust_this_device"
        i18nProps={{ count: durationDays }}
        isLoading={isSubmitting}
        onClick={() => {
          void handleDecision(true);
        }}
      />
    </SecondaryPageLayout>
  );
};

export default TrustedDevice;
