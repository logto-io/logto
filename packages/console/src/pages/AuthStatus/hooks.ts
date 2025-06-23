import { useLogto } from '@logto/react';
import { type Optional, yes } from '@silverhand/essentials';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { debugModeKey } from './consts';
import type { AdminTokenErrorMessage, AdminTokenStatusMessage, DebugLogEntry } from './types';
import { AuthMessageType } from './types';
import {
  checkStorageAccess,
  isCheckAdminTokenMessage,
  isValidOrigin,
  requestStorageAccess,
} from './utils';

/**
 * Comprehensive hook for managing all AuthStatus functionality
 */
export const useAuthStatus = () => {
  const { isAuthenticated, getIdToken } = useLogto();

  // Calculate initial debug mode state based on URL params and localStorage
  const initialDebugMode = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    const debugFlag = localStorage.getItem(debugModeKey);

    return yes(debugParam) || yes(debugFlag);
  }, []);

  const [isDebugMode, setIsDebugMode] = useState(initialDebugMode);
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [currentToken, setCurrentToken] = useState<Optional<string>>();

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

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const toggleDebugMode = useCallback(() => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    localStorage.setItem(debugModeKey, newDebugMode.toString());
    addDebugLog('info', `Debug mode ${newDebugMode ? 'enabled' : 'disabled'}`);
  }, [addDebugLog, isDebugMode]);

  // Component initialization
  useEffect(() => {
    addDebugLog('info', 'AuthStatus component mounted', {
      origin: window.location.origin,
      hostname: window.location.hostname,
      isInIframe: window !== window.top,
      userAgent: navigator.userAgent,
    });
  }, [addDebugLog]);

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

  // Handle postMessage events
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
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

      // Validate origin using enhanced validation logic
      const originIsValid = isValidOrigin(event.origin, currentOrigin);

      if (!originIsValid) {
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

          const response: AdminTokenStatusMessage = {
            type: AuthMessageType.AdminTokenStatus,
            isAuthenticated,
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
            type: AuthMessageType.AdminTokenError,
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
    },
    [addDebugLog, isAuthenticated]
  );

  // Set up message event listener
  useEffect(() => {
    // Add event listener for postMessage immediately
    window.addEventListener('message', handleMessage);
    addDebugLog('info', 'Message event listener added - ready to receive messages');

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      addDebugLog('info', 'Message event listener removed');
    };
  }, [addDebugLog, handleMessage]);

  return {
    isDebugMode,
    debugLogs,
    currentToken,
    clearDebugLogs,
    toggleDebugMode,
  };
};
