import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';

import GlobalLoading from './components/GlobalLoading';
import { completePendingStepUp, discardPendingStepUp } from './utils/step-up';

const Callback = () => {
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    // Also drops the token set a step-up keeps until its callback, so the provider treats this
    // page as signed out and the elevated tokens replace the old ones.
    void clearAllTokens();
  }, [clearAllTokens]);

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
