import { type CommonQueryMethods } from 'slonik';

export default class TenantQueries {
  constructor(public readonly pool: CommonQueryMethods) {}
}
