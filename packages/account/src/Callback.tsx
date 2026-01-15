import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';

import { clearVerificationRecord } from './Providers/PageContextProvider/verification-storage';

const Callback = () => {
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    void clearAllTokens();
    clearVerificationRecord();
  }, [clearAllTokens]);

  const { error } = useHandleSignInCallback(() => {
    window.location.replace('/account');
  });

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

  return <p>Finishing sign in…</p>;
};

export default Callback;
