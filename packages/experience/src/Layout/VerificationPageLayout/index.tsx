import { AuthenticationContextMode } from '@logto/schemas';
import { type ComponentProps } from 'react';
import { NavigationType, useNavigationType } from 'react-router-dom';

import { stepUpRoutes } from '@/constants/step-up';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useStepUpContext from '@/hooks/use-step-up-context';
import { hasAlternativeStepUpMethod } from '@/utils/step-up';

import SecondaryPageLayout from '../SecondaryPageLayout';

type Props = Omit<ComponentProps<typeof SecondaryPageLayout>, 'onBack' | 'isNavBarHidden'>;

/** Factor pages cannot rely on history: step-up dispatch and recovery may replace the chooser. */
const VerificationPageLayout = (props: Props) => {
  const { authenticationContext } = useStepUpContext();
  const navigate = useNavigateWithPreservedSearchParams();
  const navigationType = useNavigationType();

  if (authenticationContext?.mode !== AuthenticationContextMode.StepUp) {
    return <SecondaryPageLayout {...props} />;
  }

  return (
    <SecondaryPageLayout
      {...props}
      isNavBarHidden={!hasAlternativeStepUpMethod(authenticationContext.availableMethods)}
      onBack={() => {
        if (navigationType === NavigationType.Push) {
          navigate(-1);
          return;
        }

        navigate(stepUpRoutes.landing, { replace: true });
      }}
    />
  );
};

export default VerificationPageLayout;
