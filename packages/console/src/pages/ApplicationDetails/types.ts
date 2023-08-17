import { type SnakeCaseOidcConfig, type Application } from '@logto/schemas';

export type ApplicationDetailsOutletContext = {
  app: Application;
  oidcConfig: SnakeCaseOidcConfig;
};
