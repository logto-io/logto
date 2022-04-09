declare module 'slonik-interceptor-preset' {
  import { InterceptorType } from 'slonik';

  export const createInterceptors: (config?: {
    benchmarkQueries: boolean;
    logQueries: boolean;
    normaliseQueries: boolean;
    transformFieldNames: boolean;
  }) => readonly InterceptorType[];
}
