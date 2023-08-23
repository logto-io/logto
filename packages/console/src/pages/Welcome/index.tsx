import { useLogto } from '@logto/react';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/images/logo.svg';
import Button from '@/ds-components/Button';
import useRedirectUri from '@/hooks/use-redirect-uri';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

function Welcome() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { isAuthenticated, signIn } = useLogto();
  const theme = useTheme();
  const redirectUri = useRedirectUri();

  useEffect(() => {
    // If authenticated, navigate to the console root page directly
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={classNames(styles.container, styles[theme])}>
      <div className={styles.header}>
        <Logo className={styles.logo} />
      </div>
      <main>
        <div className={styles.placeholderTop} />
        <div className={styles.content}>
          <div className={styles.title}>{t('welcome.title')}</div>
          <div className={styles.description}>{t('welcome.description')}</div>
          <Button
            className={styles.button}
            size="large"
            type="branding"
            title="welcome.create_account"
            onClick={() => {
              void signIn(redirectUri.href);
            }}
          />
        </div>
        <div className={styles.placeholderBottom} />
      </main>
    </div>
  );
}

export default Welcome;
