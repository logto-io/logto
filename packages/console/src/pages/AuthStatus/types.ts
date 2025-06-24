// Message type constants
export const enum AuthMessageType {
  CheckAdminToken = 'CheckAdminToken',
  AdminTokenStatus = 'AdminTokenStatus',
  AdminTokenError = 'AdminTokenError',
}

// Request message type
export type CheckAdminTokenMessage = {
  type: AuthMessageType.CheckAdminToken;
  requestId?: string;
};

// Response message types
export type AdminTokenStatusMessage = {
  type: AuthMessageType.AdminTokenStatus;
  isAuthenticated: boolean;
  requestId?: string;
  debugInfo?: {
    isInIframe: boolean;
    storageAccessible: boolean;
    origin: string;
    hostname: string;
  };
};

export type AdminTokenErrorMessage = {
  type: AuthMessageType.AdminTokenError;
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
export type DebugLogEntry = {
  id: string;
  timestamp: string;
  type: 'received' | 'sent' | 'error' | 'info';
  message: string;
  data?: unknown;
};
