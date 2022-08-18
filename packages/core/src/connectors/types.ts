import {
  BaseConnector,
  SmsConnector,
  EmailConnector,
  SocialConnector,
  ConnectorType,
  ConnectorError,
  ConnectorErrorCodes,
} from '@logto/connector-schemas';
import { Connector, PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/connector-schemas';
export type { ConnectorMetadata } from '@logto/connector-schemas';

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;

export class SmsConnectorInstance<T = unknown> extends SmsConnector<T> {
  public connector!: Connector;
}

export class EmailConnectorInstance<T = unknown> extends EmailConnector<T> {
  public connector!: Connector;
}

export class SocialConnectorInstance<T = unknown> extends SocialConnector<T> {
  public connector!: Connector;
}

export class ConnectorInstance<T = unknown> extends BaseConnector<T> {
  public connector!: Connector;
}

export const isSmsConnectorInstance = (
  instance: unknown
): asserts instance is SmsConnectorInstance => {
  if (!(instance instanceof ConnectorInstance && instance.metadata.type === ConnectorType.SMS)) {
    throw new ConnectorError(ConnectorErrorCodes.General);
  }
};

export const isEmailConnectorInstance = (
  instance: unknown
): asserts instance is EmailConnectorInstance => {
  if (!(instance instanceof ConnectorInstance && instance.metadata.type === ConnectorType.Email)) {
    throw new ConnectorError(ConnectorErrorCodes.General);
  }
};

export const isSocialConnectorInstance = (
  instance: unknown
): asserts instance is SocialConnectorInstance => {
  if (!(instance instanceof ConnectorInstance && instance.metadata.type === ConnectorType.Social)) {
    throw new ConnectorError(ConnectorErrorCodes.General);
  }
};
