import { useLogto } from '@logto/react';
import { useEffect } from 'react';

/**
 * This component keep children as is, but throw error if there is any error from Logto
 * (`useLogto()`). The error should be handled by the upper `<ErrorBoundary />`.
 */
export default function LogtoErrorBoundary({ children }: { children: JSX.Element }) {
  const { error } = useLogto();

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return children;
}
