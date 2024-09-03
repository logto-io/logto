import { ApplicationType } from '../db-entries/custom-types.js';

/** If the application type has (or can have) secrets. */
export const hasSecrets = (type: ApplicationType) =>
  [
    ApplicationType.MachineToMachine,
    ApplicationType.Protected,
    ApplicationType.Traditional,
  ].includes(type);
