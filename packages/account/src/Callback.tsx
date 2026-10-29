import { useHandleSignInCallback } from '@logto/react';
import { useEffect } from 'react';

import GlobalLoading from './components/GlobalLoading';
import { completePendingStepUp, discardPendingStepUp } from './utils/step-up';

const Callback = () => {
  const { error } = useHandleSignInCallback(() => {
    completePendingStepUp();
    window.location.replace('/account');
  });

  useEffect(() => {
    if (error) {
      // The pending action must not run without the token set this callback failed to obtain.
      discardPendingStepUp();
    }
  }, [error]);

  if (error) {
    return (
      <>
        <p>We couldn&apos;t complete the sign in callback.</p>
        <pre>{error.message}</pre>
        <button
          type="button"
          onClick={() => {
            window.location.replace('/account');
          }}
        >
          Back to sign in
        </button>
      </>
    );
  }

  return <GlobalLoading />;
};

export default Callback;
