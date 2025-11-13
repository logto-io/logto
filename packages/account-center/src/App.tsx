import { type IdTokenClaims, LogtoProvider, useLogto } from '@logto/react';
import { accountCenterApplicationId } from '@logto/schemas';
import { useEffect, useState } from 'react';

import Callback from './Callback';

const redirectUri = `${window.location.origin}/account-center`;

const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const isInCallback = Boolean(params.get('code'));
  const { isAuthenticated, isLoading, getIdTokenClaims, signIn, signOut } = useLogto();
  const [user, setUser] = useState<Pick<IdTokenClaims, 'sub' | 'username'>>();
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setUser(undefined);
      setIsLoadingUser(false);
      return;
    }

    const loadUser = async () => {
      setIsLoadingUser(true);

      try {
        const claims = await getIdTokenClaims();
        setUser(claims ?? undefined);
      } finally {
        setIsLoadingUser(false);
      }
    };

    void loadUser();
  }, [getIdTokenClaims, isAuthenticated]);

  useEffect(() => {
    if (isInCallback || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      void signIn({ redirectUri });
    }
  }, [isAuthenticated, isInCallback, isLoading, signIn]);

  if (isInCallback) {
    return <Callback />;
  }

  if (isLoading || isLoadingUser) {
    return (
      <main>
        <h1>Account Center</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Account Center</h1>
        <p>Redirecting to sign in…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Account Center</h1>
      <p>
        Signed in as <strong>{user?.username ?? user?.sub ?? 'your account'}</strong>.
      </p>
      <button
        type="button"
        onClick={() => {
          void signOut(redirectUri);
        }}
      >
        Sign out
      </button>
    </main>
  );
};

const App = () => (
  <LogtoProvider
    config={{
      endpoint: window.location.origin,
      appId: accountCenterApplicationId,
    }}
  >
    <Main />
  </LogtoProvider>
);

export default App;
