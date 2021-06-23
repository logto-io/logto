import { createPool } from 'slonik';
import { createQueryNormalisationInterceptor } from 'slonik-interceptor-query-normalisation';
import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';

const interceptors = [
  createQueryNormalisationInterceptor(),
  createFieldNameTransformationInterceptor({ format: 'CAMEL_CASE' }),
];

const pool = createPool('postgres://localhost/logto', { interceptors });

export default pool;
