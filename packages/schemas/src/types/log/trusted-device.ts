export type Prefix = 'TrustedDevice';

export const prefix: Prefix = 'TrustedDevice';

export enum Type {
  Created = 'Created',
  Used = 'Used',
}

export type LogKey = `${Prefix}.${Type}`;
