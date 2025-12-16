import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';

const Callback = () => {
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    void clearAllTokens();
  }, [clearAllTokens]);

  const { error } = useHandleSignInCallback(() => {
    window.location.assign('/account');
  });

  if (error) {
    return (
      <>
        <p>We couldn&apos;t complete the sign in callback.</p>
        <pre>{error.message}</pre>
        <button
          type="button"
          onClick={() => {
            window.location.assign('/account');
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
