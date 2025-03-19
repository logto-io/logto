import { experience } from '@logto/schemas';
import { useMemo } from 'react';

const useFallbackRoute = () =>
  useMemo(() => {
    const fallbackKey = new URLSearchParams(window.location.search).get('fallback');
    return (
      Object.entries(experience.routes).find(([key]) => key === fallbackKey)?.[1] ??
      experience.routes.signIn
    );
  }, []);

export default useFallbackRoute;
