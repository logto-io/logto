declare module 'slonik-interceptor-field-name-transformation' {
  import { InterceptorType } from 'slonik';

  export const createFieldNameTransformationInterceptor: (config?: {
    format: 'CAMEL_CASE';
  }) => InterceptorType;
}
