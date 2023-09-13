import type { User, Application } from '@logto/schemas';

export const isUser = (entity: User | Application): entity is User =>
  'customData' in entity || 'identities' in entity;
