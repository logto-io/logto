import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';

const LoadErrorPage = () => {
  const { load } = useStepUpContext();

  return (
    <ErrorPage
      isNavbarHidden
      title="error.something_went_wrong"
      primaryAction={{
        title: 'action.continue',
        onClick: () => {
          void load(false);
        },
      }}
    />
  );
};

export default LoadErrorPage;
