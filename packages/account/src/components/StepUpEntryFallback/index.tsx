import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';

type Props = {
  /**
   * A completed step-up still left the context stale. Starting another one would loop through the
   * authorization endpoint, so the page explains that the verification was not completed.
   */
  readonly hasFailed: boolean;
};

/**
 * What a standalone subpage renders while its entry step-up runs. The page only mounts its form
 * and its Account API calls after the context is ready.
 */
const StepUpEntryFallback = ({ hasFailed }: Props) => {
  if (hasFailed) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.verification.step_up_not_completed"
      />
    );
  }

  return <GlobalLoading />;
};

export default StepUpEntryFallback;
