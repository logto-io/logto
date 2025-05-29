import { yes } from '@silverhand/essentials';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import pageLayout from '@/scss/page-layout.module.scss';

import styles from './index.module.scss';

const ADMIN_CONSOLE_ID_TOKEN_KEY = 'logto:admin-console:idToken';
const DEBUG_MODE_KEY = '_auth_status_checker_debug_mode';

// Message type constants
const enum AuthMessageType {
  CHECK_ADMIN_TOKEN = 'CHECK_ADMIN_TOKEN',
  ADMIN_TOKEN_STATUS = 'ADMIN_TOKEN_STATUS',
  ADMIN_TOKEN_ERROR = 'ADMIN_TOKEN_ERROR',
}

// Request message type
type CheckAdminTokenMessage = {
  type: AuthMessageType.CHECK_ADMIN_TOKEN;
  requestId?: string;
};

// Response message types
type AdminTokenStatusMessage = {
  type: AuthMessageType.ADMIN_TOKEN_STATUS;
  hasToken: boolean;
  requestId?: string;
  debugInfo?: {
    isInIframe: boolean;
    storageAccessible: boolean;
    origin: string;
    hostname: string;
  };
};

type AdminTokenErrorMessage = {
  type: AuthMessageType.ADMIN_TOKEN_ERROR;
  error: string;
  requestId?: string;
  debugInfo?: {
    isInIframe: boolean;
    storageAccessible: boolean;
    origin: string;
    hostname: string;
    errorDetails?: string;
  };
};

// Debug log entry type
type DebugLogEntry = {
  timestamp: string;
  type: 'received' | 'sent' | 'error' | 'info';
  message: string;
  data?: unknown;
};

// Type guard function to safely check if data is CheckAdminTokenMessage
const isCheckAdminTokenMessage = (data: unknown): data is CheckAdminTokenMessage => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return (
    Object.hasOwn(data, 'type') && Reflect.get(data, 'type') === AuthMessageType.CHECK_ADMIN_TOKEN
  );
};

/**
 * Check if localStorage is accessible in the current context
 */
const checkStorageAccess = (): { accessible: boolean; error?: string } => {
  try {
    // Test if we can access localStorage
    const testKey = '__logto_storage_test__';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (testValue !== 'test') {
      return { accessible: false, error: 'localStorage read/write test failed' };
    }

    return { accessible: true };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown localStorage error',
    };
  }
};

/**
 * Request storage access using the Storage Access API
 */
const requestStorageAccess = async (): Promise<{
  granted: boolean;
  hasAccess: boolean;
  error?: string;
}> => {
  try {
    // Check if Storage Access API is available
    if (!('requestStorageAccess' in document) || !('hasStorageAccess' in document)) {
      return { granted: false, hasAccess: false, error: 'Storage Access API not available' };
    }

    // Check if we already have storage access
    const hasAccess = await document.hasStorageAccess();
    if (hasAccess) {
      return { granted: true, hasAccess: true };
    }

    // Request storage access
    await document.requestStorageAccess();
    const newHasAccess = await document.hasStorageAccess();

    return { granted: newHasAccess, hasAccess: newHasAccess };
  } catch (error) {
    return {
      granted: false,
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Storage access request failed',
    };
  }
};

/**
 * Cross-domain authentication status checker page
 * This page is designed to be embedded as an iframe to check login status
 * across same-origin subdomains and localhost for development.
 */
function AuthStatusChecker() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | undefined>(undefined);

  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');
  const debugFlag = localStorage.getItem(DEBUG_MODE_KEY);

  // Check if we're in debug mode (query parameter or localStorage flag)
  useEffect(() => {
    if (yes(debugParam) || yes(debugFlag)) {
      setIsDebugMode(true);
    }
  }, [debugParam, debugFlag]);

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

      console.log(`[AuthStatusChecker] ${type.toUpperCase()}: ${message}`, data);
      setDebugLogs((previous) => [...previous, logEntry]);
    },
    [isDebugMode]
  );

  // Monitor token changes
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_CONSOLE_ID_TOKEN_KEY);
    setCurrentToken(token ?? undefined);
    addDebugLog('info', `Current token status: ${token ? 'present' : 'absent'}`, {
      tokenLength: token?.length,
    });
  }, []);

  useEffect(() => {
    addDebugLog('info', 'AuthStatusChecker component mounted', {
      origin: window.location.origin,
      hostname: window.location.hostname,
      isInIframe: window !== window.top,
      userAgent: navigator.userAgent,
    });

    const handleMessage = async (event: MessageEvent) => {
      addDebugLog('received', `Message from ${event.origin}`, {
        origin: event.origin,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: event.data,
        source: event.source === window.parent ? 'parent' : 'other',
      });

      // For security, we should validate the origin
      const currentOrigin = window.location.origin;
      const currentHostname = window.location.hostname;
      const eventOriginUrl = new URL(event.origin);
      const eventHostname = eventOriginUrl.hostname;

      // Allow communication if:
      // 1. Same origin (exact match)
      // 2. Same top-level domain (e.g., *.domain.com)
      // 3. Both are localhost (for development)
      const isValidOrigin =
        event.origin === currentOrigin || // Same origin
        (currentHostname === 'localhost' && eventHostname === 'localhost') || // Both localhost
        // Same top-level domain check
        (currentHostname.includes('.') &&
          eventHostname.includes('.') &&
          currentHostname.split('.').slice(-2).join('.') ===
            eventHostname.split('.').slice(-2).join('.'));

      if (!isValidOrigin) {
        addDebugLog('error', `Invalid origin rejected: ${event.origin}`, {
          currentOrigin,
          currentHostname,
          eventOrigin: event.origin,
          eventHostname,
        });
        return;
      }

      addDebugLog('info', `Origin validation passed for: ${event.origin}`);

      // Check if the message is requesting token status using type guard
      if (isCheckAdminTokenMessage(event.data)) {
        const { source } = event;
        const { requestId } = event.data;

        addDebugLog('info', `Processing auth check request`, { requestId });

        // Check if we're in an iframe
        const isInIframe = window !== window.top;

        // Try to request storage access if we're in an iframe
        const storageAccessResult = isInIframe
          ? await requestStorageAccess()
          : { granted: false, hasAccess: false };

        // Check storage accessibility after potentially requesting access
        const storageCheck = checkStorageAccess();

        const debugInfo = {
          isInIframe,
          storageAccessible: storageCheck.accessible,
          origin: currentOrigin,
          hostname: currentHostname,
        };

        addDebugLog('info', 'Storage access check completed', {
          storageCheck,
          storageAccessResult,
          debugInfo,
        });

        try {
          if (!storageCheck.accessible) {
            throw new Error(`localStorage not accessible: ${storageCheck.error}`);
          }

          const hasToken = Boolean(localStorage.getItem(ADMIN_CONSOLE_ID_TOKEN_KEY));

          const response: AdminTokenStatusMessage = {
            type: AuthMessageType.ADMIN_TOKEN_STATUS,
            hasToken,
            requestId,
            debugInfo,
          };

          addDebugLog('sent', 'Sending success response', response);

          // Send response back to the requesting origin
          if (source && 'postMessage' in source) {
            source.postMessage(response, { targetOrigin: event.origin });
            addDebugLog('info', 'Response sent successfully');
          } else {
            addDebugLog('error', 'No valid source to send response to');
          }
        } catch (error) {
          // Handle localStorage access errors (e.g., in private browsing mode, iframe restrictions)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          const errorResponse: AdminTokenErrorMessage = {
            type: AuthMessageType.ADMIN_TOKEN_ERROR,
            error: 'Failed to access localStorage',
            requestId,
            debugInfo: {
              ...debugInfo,
              errorDetails: errorMessage,
            },
          };

          addDebugLog('sent', 'Sending error response', errorResponse);

          if (source && 'postMessage' in source) {
            source.postMessage(errorResponse, { targetOrigin: event.origin });
            addDebugLog('info', 'Error response sent successfully');
          } else {
            addDebugLog('error', 'No valid source to send error response to');
          }
        }
      } else {
        addDebugLog('error', 'Invalid message format received', event.data);
      }
    };

    // Add event listener for postMessage immediately
    window.addEventListener('message', handleMessage);
    addDebugLog('info', 'Message event listener added - ready to receive messages');

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      addDebugLog('info', 'Message event listener removed');
    };
  }, [addDebugLog]); // Empty dependency array to ensure this runs only once on mount

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    localStorage.setItem(DEBUG_MODE_KEY, newDebugMode.toString());
    addDebugLog('info', `Debug mode ${newDebugMode ? 'enabled' : 'disabled'}`);
  };

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
          <button className={`${styles.button} ${styles.secondary}`} onClick={clearDebugLogs}>
            Clear Logs
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={toggleDebugMode}>
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
                className={`${styles.logEntry} ${styles[log.type]}`}
              >
                <div className={`${styles.logHeader} ${styles[log.type]}`}>
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

export default AuthStatusChecker;
