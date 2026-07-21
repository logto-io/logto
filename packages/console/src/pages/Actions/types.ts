import { type LogtoAction, type LogtoActionKey } from '@logto/schemas';

export enum ActionPageMode {
  Create = 'create',
  Edit = 'edit',
}

export type ActionConfig = {
  key: LogtoActionKey;
  value: LogtoAction;
};
