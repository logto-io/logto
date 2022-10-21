declare module 'slonik-interceptor-preset' {
  import type { Interceptor } from 'slonik';

  export const createInterceptors: (config?: {
    benchmarkQueries: boolean;
    logQueries: boolean;
    normaliseQueries: boolean;
    transformFieldNames: boolean;
  }) => readonly Interceptor[];
}
