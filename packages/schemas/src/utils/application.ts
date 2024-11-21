import { ApplicationType } from '../db-entries/custom-types.js';

/** If the application type has (or can have) secrets. */
export const hasSecrets = (type: ApplicationType) =>
  [
    ApplicationType.MachineToMachine,
    ApplicationType.Protected,
    ApplicationType.Traditional,
    // SAML applications are used as traditional web applications.
    ApplicationType.SAML,
  ].includes(type);
