import {
  LogtoConnector,
  SendMessageFunction,
  AuthResponseParser,
  GetAuthorizationUri,
  GetUserInfo,
} from '@logto/connector-schemas';
import { Connector, PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;

export class ConnectorInstance<T = unknown> extends LogtoConnector<T> {
  public connector!: Connector;
}

export class SmsConnectorInstance<T = unknown> extends LogtoConnector<T> {
  public connector!: Connector;
  public sendMessage!: SendMessageFunction;
  public sendTestMessage?: SendMessageFunction;
  protected readonly sendMessageBy!: SendMessageFunction<T>;
}

export class EmailConnectorInstance<T = unknown> extends LogtoConnector<T> {
  public connector!: Connector;
  public sendMessage!: SendMessageFunction;
  public sendTestMessage?: SendMessageFunction;
  protected readonly sendMessageBy!: SendMessageFunction<T>;
}

export class SocialConnectorInstance<T = unknown> extends LogtoConnector<T> {
  public connector!: Connector;
  public getAuthorizationUri!: GetAuthorizationUri;
  public getUserInfo!: GetUserInfo;

  protected authResponseParser?: AuthResponseParser;
}
