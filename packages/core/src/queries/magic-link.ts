import {
  type CreateMagicLink,
  type MagicLink,
  type MagicLinkKeys,
  MagicLinks,
} from '@logto/schemas';
import { type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

export default class MagicLinkQueries extends SchemaQueries<
  MagicLinkKeys,
  CreateMagicLink,
  MagicLink
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, MagicLinks);
  }
}
