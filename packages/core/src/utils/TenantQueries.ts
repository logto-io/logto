import { type CommonQueryMethods } from 'slonik';

export default abstract class TenantQueries {
  constructor(public readonly pool: CommonQueryMethods) {}
}
