import { type InlineHook, type LogtoInlineHookKey } from '@logto/schemas';

export enum InlineHookAction {
  Create = 'create',
  Edit = 'edit',
}

export type InlineHookConfig = {
  key: LogtoInlineHookKey;
  value: InlineHook;
};
