import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import pageLayout from '@/scss/page-layout.module.scss';

import { useAuthStatus } from './hooks';
import styles from './index.module.scss';

/**
 * Global auth status checker page for cross-domain authentication status checking.
 * This page is designed to be embedded as an iframe to check login status
 * across same-origin subdomains and localhost for development.
 */
function AuthStatus() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Use the comprehensive hook for all functionality
  const { isDebugMode, debugLogs, currentToken, clearDebugLogs, toggleDebugMode } = useAuthStatus();

  if (!isDebugMode) {
    return (
      <div className={styles.hidden}>
        <PageMeta titleKey="auth_status.page_title" />
        <div className={pageLayout.title}>{t('auth_status.title')}</div>
        <div className={pageLayout.description}>{t('auth_status.description')}</div>
      </div>
    );
  }

  return (
    <div className={styles.debugContainer}>
      <PageMeta titleKey="auth_status.page_title" />

      <div className={styles.debugHeader}>
        <h2 className={styles.title}>Auth Status Checker - Debug Mode</h2>
        <p className={styles.info}>Origin: {window.location.origin}</p>
        <p className={styles.info}>In iframe: {window === window.top ? 'No' : 'Yes'}</p>
        <div className={styles.info}>
          Current token:{' '}
          {currentToken ? (
            <div className={styles.tokenContainer}>
              <span>Present ({currentToken.slice(0, 20)}...)</span>
              <CopyToClipboard
                value={currentToken}
                variant="icon"
                size="small"
                displayType="inline"
              />
            </div>
          ) : (
            'Absent'
          )}
        </div>

        <div className={styles.controls}>
          <button className={classNames(styles.button, styles.secondary)} onClick={clearDebugLogs}>
            Clear Logs
          </button>
          <button className={classNames(styles.button, styles.secondary)} onClick={toggleDebugMode}>
            Disable Debug
          </button>
        </div>
      </div>

      <div className={styles.logsContainer}>
        <div className={styles.logsHeader}>Debug Logs ({debugLogs.length})</div>
        <div className={styles.logsContent}>
          {debugLogs.length === 0 ? (
            <div className={styles.emptyState}>No logs yet...</div>
          ) : (
            debugLogs.map((log) => (
              <div key={log.id} className={classNames(styles.logEntry, styles[log.type])}>
                <div className={classNames(styles.logHeader, styles[log.type])}>
                  [{log.timestamp.split('T')[1]?.split('.')[0] ?? 'unknown'}]{' '}
                  {log.type.toUpperCase()}: {log.message}
                </div>
                {Boolean(log.data) && (
                  <pre className={styles.logData}>{JSON.stringify(log.data, null, 2)}</pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthStatus;
