import {
  InteractionEvent,
  LogtoActionKey,
  VerificationType,
  type PreRegisterEvent,
} from '@logto/schemas';

import type { ModelSettings } from '@/components/MonacoCodeEditor';

import {
  ActionTypeDefinitionKey,
  preRegisterEventTypeDefinition,
  preRegisterResultTypeDefinition,
  preRegisterUserTypeDefinition,
} from './type-definitions';

export const defaultPreRegisterEvent: PreRegisterEvent = {
  key: LogtoActionKey.PreRegister,
  interactionEvent: InteractionEvent.Register,
  verificationTypes: [VerificationType.EmailVerificationCode],
  user: {
    primaryEmail: 'jane@example.com',
    name: 'Jane Doe',
  },
  applicationId: 'app_123',
  request: {
    ip: '203.0.113.10',
    userAgent: 'Mozilla/5.0',
  },
};

const defaultPreRegisterScript = `/**
 * Pre-register action.
 * Called before a new user is created. Return \`{ action: 'deny' }\` to reject the registration.
 *
 * @param {Payload} payload - The input argument of the function.
 *
 * @returns The action result.
 */
const runAction = async ({ event, environmentVariables }) => {
  // Write your custom logic here.

  return {
    action: 'allow',
  };
};
`;

const preRegisterDefinition = `
declare type Payload = {
  /**
   * Registration event payload for the user about to be created.
   */
  event: ${ActionTypeDefinitionKey.PreRegisterEvent};
  /**
   * Custom environment variables configured for this action.
   */
  environmentVariables: ${ActionTypeDefinitionKey.EnvironmentVariables};
};
`;

export const preRegisterModel: ModelSettings = {
  name: 'pre-register.js',
  // Display name for this action; runtime entry remains `runAction`.
  title: 'Pre-register',
  language: 'typescript',
  defaultValue: defaultPreRegisterScript,
  extraLibs: [
    {
      content: preRegisterDefinition,
      filePath: 'file:///logto-action.d.ts',
    },
    {
      content: `declare ${preRegisterUserTypeDefinition}

declare ${preRegisterEventTypeDefinition}

declare ${preRegisterResultTypeDefinition}`,
      filePath: 'file:///logto-action-context.d.ts',
    },
  ],
};
