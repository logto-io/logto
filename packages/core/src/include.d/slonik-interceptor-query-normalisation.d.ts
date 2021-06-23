declare module 'slonik-interceptor-query-normalisation' {
  import { InterceptorType } from 'slonik';

  export const createQueryNormalisationInterceptor: (config?: {
    stripComments?: boolean;
  }) => InterceptorType;
}
