import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';

const Callback = () => {
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    void clearAllTokens();
  }, [clearAllTokens]);

  const { error } = useHandleSignInCallback(() => {
    window.location.assign('/account-center');
  });

  if (error) {
    return (
      <main>
        <h1>Account Center</h1>
        <p>We couldn&apos;t complete the sign in callback.</p>
        <pre>{error.message}</pre>
        <button
          type="button"
          onClick={() => {
            window.location.assign('/account-center');
          }}
        >
          Back to sign in
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Account Center</h1>
      <p>Finishing sign in…</p>
    </main>
  );
};

export default Callback;
