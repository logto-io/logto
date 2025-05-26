// Message type constants
export const enum AuthMessageType {
  CHECK_ADMIN_TOKEN = 'CHECK_ADMIN_TOKEN',
  ADMIN_TOKEN_STATUS = 'ADMIN_TOKEN_STATUS',
  ADMIN_TOKEN_ERROR = 'ADMIN_TOKEN_ERROR',
}

// Request message type
export type CheckAdminTokenMessage = {
  type: AuthMessageType.CHECK_ADMIN_TOKEN;
  requestId?: string;
};

// Response message types
export type AdminTokenStatusMessage = {
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

export type AdminTokenErrorMessage = {
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
export type DebugLogEntry = {
  timestamp: string;
  type: 'received' | 'sent' | 'error' | 'info';
  message: string;
  data?: unknown;
};
