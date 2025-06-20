import { useCallback, useEffect } from 'react';

import type { AdminTokenErrorMessage, AdminTokenStatusMessage, DebugLogEntry } from './types';
import { AuthMessageType } from './types';
import {
  checkStorageAccess,
  isCheckAdminTokenMessage,
  isValidOrigin,
  requestStorageAccess,
} from './utils';

/**
 * Hook for handling component initialization and debug logging
 */
export const useAuthStatusInitialization = (
  addDebugLog: (type: DebugLogEntry['type'], message: string, data?: unknown) => void
) => {
  useEffect(() => {
    addDebugLog('info', 'AuthStatus component mounted', {
      origin: window.location.origin,
      hostname: window.location.hostname,
      isInIframe: window !== window.top,
      userAgent: navigator.userAgent,
    });
  }, [addDebugLog]);
};

/**
 * Hook for handling postMessage events and auth status checking
 */
export const usePostMessageHandler = (
  isAuthenticated: boolean,
  addDebugLog: (type: DebugLogEntry['type'], message: string, data?: unknown) => void
) => {
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
};
