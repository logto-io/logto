import { adminTenantId } from '@logto/schemas';

import type { Queries } from '#src/queries/index.js';

export class ServicesLibrary {
  constructor(public readonly queries: Queries) {}

  async getTenantIdFromApplicationId(applicationId: string) {
    const application = await this.queries.applications.findApplicationById(
      applicationId,
      adminTenantId
    );

    return application.customClientMetadata.tenantId;
  }
}
