import { useLogto } from '@logto/react';
import { type Optional, yes } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import pageLayout from '@/scss/page-layout.module.scss';

import { DEBUG_MODE_KEY } from './consts';
import { useAuthStatusInitialization, usePostMessageHandler } from './hooks';
import styles from './index.module.scss';
import type { DebugLogEntry } from './types';

/**
 * Cross-domain authentication status checker page
 * This page is designed to be embedded as an iframe to check login status
 * across same-origin subdomains and localhost for development.
 */
function AuthStatus() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [currentToken, setCurrentToken] = useState<Optional<string>>(undefined);
  const { isAuthenticated, getIdToken } = useLogto();

  // Calculate initial debug mode state based on URL params and localStorage
  const initialDebugMode = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    const debugFlag = localStorage.getItem(DEBUG_MODE_KEY);

    return yes(debugParam) || yes(debugFlag);
  }, []);

  const [isDebugMode, setIsDebugMode] = useState(initialDebugMode);

  // Add debug log entry
  const addDebugLog = useCallback(
    (type: DebugLogEntry['type'], message: string, data?: unknown) => {
      // Skip logging if debug mode is not enabled.
      if (!isDebugMode) {
        return;
      }

      const logEntry: DebugLogEntry = {
        timestamp: new Date().toISOString(),
        type,
        message,
        data,
      };

      console.log(`[AuthStatus] ${type.toUpperCase()}: ${message}`, data);
      setDebugLogs((previous) => [...previous, logEntry]);
    },
    [isDebugMode]
  );

  // Monitor token changes
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getIdToken();
      setCurrentToken(token ?? undefined);
      addDebugLog('info', `Current token status: ${token ? 'present' : 'absent'}`, {
        tokenLength: token?.length,
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchToken();
  }, [addDebugLog, getIdToken]);

  // Use custom hooks to handle initialization and message processing
  useAuthStatusInitialization(addDebugLog);
  usePostMessageHandler(isAuthenticated, addDebugLog);

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const toggleDebugMode = useCallback(() => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    localStorage.setItem(DEBUG_MODE_KEY, newDebugMode.toString());
    addDebugLog('info', `Debug mode ${newDebugMode ? 'enabled' : 'disabled'}`);
  }, [addDebugLog, isDebugMode]);

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
        <p className={styles.info}>
          Current token: {currentToken ? `Present (${currentToken.slice(0, 20)}...)` : 'Absent'}
        </p>

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
            debugLogs.map((log, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={classNames(styles.logEntry, styles[log.type])}
              >
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
