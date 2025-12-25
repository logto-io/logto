import { useLogto } from '@logto/react';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

/**
 * Keep children untouched but throw Logto errors so upper error boundary can handle them.
 */
const LogtoErrorBoundary = ({ children }: { readonly children: ReactElement }) => {
  const { error } = useLogto();

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return children;
};

export default LogtoErrorBoundary;
