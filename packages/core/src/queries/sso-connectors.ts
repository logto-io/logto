import {
  type CreateSsoConnector,
  type SsoConnector,
  type SsoConnectorKeys,
  SsoConnectors,
} from '@logto/schemas';
import { type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

export default class SsoConnectorQueries extends SchemaQueries<
  SsoConnectorKeys,
  CreateSsoConnector,
  SsoConnector
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, SsoConnectors);
  }
}
