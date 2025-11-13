import { type IdTokenClaims, LogtoProvider, useLogto } from '@logto/react';
import { accountCenterApplicationId } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import styles from './App.module.scss';
import Callback from './Callback';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import BrandingHeader from './components/BrandingHeader';
import initI18n from './i18n/init';

import '@/scss/normalized.scss';

void initI18n();

const redirectUri = `${window.location.origin}/account-center`;

const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const isInCallback = Boolean(params.get('code'));
  const { isAuthenticated, isLoading, getIdTokenClaims, signIn, signOut } = useLogto();
  const [user, setUser] = useState<Pick<IdTokenClaims, 'sub' | 'username'>>();
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { isLoadingExperience, experienceError } = useContext(PageContext);

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
    return (
      <div>
        <Callback />
      </div>
    );
  }

  if (experienceError) {
    return (
      <div>
        <p>We were unable to load your experience settings. Please refresh the page.</p>
      </div>
    );
  }

  if (isLoading || isLoadingUser || isLoadingExperience) {
    return (
      <div>
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Signed in as <strong>{user?.username ?? user?.sub ?? 'your account'}</strong>.
      </p>
      <div>
        <button
          type="button"
          onClick={() => {
            void signOut(redirectUri);
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <LogtoProvider
    config={{
      endpoint: window.location.origin,
      appId: accountCenterApplicationId,
    }}
  >
    <PageContextProvider>
      <div className={styles.app}>
        <BrandingHeader />
        <Main />
      </div>
    </PageContextProvider>
  </LogtoProvider>
);

export default App;
