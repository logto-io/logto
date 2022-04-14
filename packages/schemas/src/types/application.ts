import { Application } from '../db-entries';
import { OidcConfig } from './oidc-config';

export interface ApplicationDTO extends Application {
  oidcConfig: OidcConfig;
}
