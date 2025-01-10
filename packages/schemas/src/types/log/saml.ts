export type Prefix = 'SamlApplication';

export const prefix: Prefix = 'SamlApplication';

export enum Scenario {
  Callback = 'Callback',
  AuthnRequest = 'AuthnRequest',
}

export type LogKey = `${Prefix}.${Scenario}`;
