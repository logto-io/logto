import { ApplicationType } from '@logto/schemas';

export type TypedApplicationCase = {
  type: ApplicationType;
  name: string;
  description: string;
};

const native: TypedApplicationCase = {
  type: ApplicationType.Native,
  name: 'Native App',
  description: 'This is a native app',
};

const spa: TypedApplicationCase = {
  type: ApplicationType.SPA,
  name: 'Single Page App',
  description: 'This is a single page app',
};

const traditional: TypedApplicationCase = {
  type: ApplicationType.Traditional,
  name: 'Traditional Web App',
  description: 'This is a traditional web app',
};

const machineToMachine: TypedApplicationCase = {
  type: ApplicationType.MachineToMachine,
  name: 'Machine to Machine App',
  description: 'This is a machine to machine app',
};

export const typedApplicationCases = [native, spa, traditional, machineToMachine];
