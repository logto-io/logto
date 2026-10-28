import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import { accountCenterBasePath } from '@ac/utils/account-center-route';
import {
  type StepUpFailure as StepUpFailureType,
  unmetAuthenticationRequirementsError,
} from '@ac/utils/step-up';

type Props = {
  readonly failure: StepUpFailureType;
};

/**
 * Shown instead of the app when the authorization endpoint answers a step-up with an OIDC error.
 * The pending action is already discarded; the user goes back to the page the step-up started
 * from, which still has the token set from before the step-up, and no other verification is
 * offered.
 */
const StepUpFailure = ({ failure: { error, route, action } }: Props) => {
  const { isLoadingExperience } = useContext(PageContext);
  const isUnmet = error === unmetAuthenticationRequirementsError;
  // An entry-guard step-up starts from the guarded subpage itself. Returning there would start
  // the same step-up again, so send the user to the account root instead.
  const backRoute = action.type === 'enter-subpage' ? accountCenterBasePath : route;

  // Wait for the sign-in experience, which loads the phrases in the user's language.
  if (isLoadingExperience) {
    return <GlobalLoading />;
  }

  return (
    <ErrorPage
      titleKey={isUnmet ? 'step_up.no_method_available' : 'error.something_went_wrong'}
      messageKey={
        isUnmet
          ? 'step_up.no_method_available_description'
          : 'account_center.verification.step_up_not_completed'
      }
      action={{
        titleKey: 'action.back',
        onClick: () => {
          window.location.replace(backRoute);
        },
      }}
    />
  );
};

export default StepUpFailure;
