import { LogtoClientError, LogtoError, OidcError, LogtoRequestError } from '@logto/react';
import { conditional } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import { type TFunction } from 'i18next';
import { HTTPError } from 'ky';
import type { ReactNode } from 'react';
import { Component } from 'react';
import { withTranslation } from 'react-i18next';

import AppError from '@/components/AppError';
import SessionExpired from '@/components/SessionExpired';
import { isInCallback } from '@/utils/url';

/**
 * Returns true if the error is an OIDC invalid_grant error.
 *
 * OIDC request error is globally converted to the LogtoRequestError.
 * @see {@link @logto/core/packages/core/src/middleware/koa-oidc-error-handler.ts}
 * We need to check the error code to determine if it is an OIDC invalid_grant error.
 */
const isOidcInvalidGrantError = (error: Error) => {
  if (!(error instanceof LogtoRequestError)) {
    return false;
  }

  const oidcGrantErrors = ['oidc.invalid_grant', 'oidc.invalid_target'];

  return oidcGrantErrors.includes(error.code);
};

type Props = {
  readonly children: ReactNode;
  readonly t: TFunction<'translation', 'admin_console'>;
};

type State = {
  error?: Error;
};

/**
 * An error boundary that catches errors in its children.
 * Note it uses several hooks and contexts:
 *
 * - Includes `useLogto()` (depending on `<LogtoProvider />`) to provide a "Sign in again" button for session expired errors.
 * - Includes `useTranslation()` to provide translations for the error messages.
 * - includes `useTheme()` (depending on `<AppThemeProvider />`) to provide the local stored theme.
 */
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public state: State = {};

  render() {
    const { children, t } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    // Different strategies for handling errors in callback pages since the callback errors
    // are likely unexpected and unrecoverable.
    if (isInCallback()) {
      if (error instanceof LogtoError && error.data instanceof OidcError) {
        return (
          <AppError
            errorCode={error.data.error}
            errorMessage={error.data.errorDescription}
            callStack={error.stack}
          />
        );
      }

      return (
        <AppError errorCode={error.name} errorMessage={error.message} callStack={error.stack} />
      );
    }

    // Insecure contexts error is not recoverable
    if (error instanceof LogtoError && error.code === 'crypto_subtle_unavailable') {
      return <AppError errorMessage={t('errors.insecure_contexts')} callStack={error.stack} />;
    }

    // Treat other Logto errors and 401 responses as session expired
    if (
      error instanceof LogtoError ||
      error instanceof LogtoClientError ||
      isOidcInvalidGrantError(error) ||
      (error instanceof HTTPError && error.response.status === 401) ||
      (error instanceof ResponseError && error.status === 401)
    ) {
      return <SessionExpired />;
    }

    const callStack = conditional(
      typeof error === 'object' &&
        typeof error.stack === 'string' &&
        error.stack.split('\n').slice(1).join('\n')
    );

    return <AppError errorMessage={error.message} callStack={callStack} />;
  }
}

export default withTranslation('translation', { keyPrefix: 'admin_console' })(ErrorBoundary);
