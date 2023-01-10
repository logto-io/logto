import type Provider from 'oidc-provider';

import type { ModelRouters } from '#src/model-routers/index.js';

import type Libraries from './Libraries.js';
import type Queries from './Queries.js';

export default abstract class TenantContext {
  public abstract readonly provider: Provider;
  public abstract readonly queries: Queries;
  public abstract readonly libraries: Libraries;
  public abstract readonly modelRouters: ModelRouters;
}
