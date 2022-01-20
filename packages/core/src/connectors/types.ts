import { Languages } from '@logto/phrases';
import { ConnectorConfig, ConnectorType } from '@logto/schemas';

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
}

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export interface ConnectorInstance {
  metadata: ConnectorMetadata;
  sendMessage: EmailSendMessageFunction;
}

export interface EmailMessageTypes {
  SignIn: {
    code: string;
  };
  Register: {
    code: string;
  };
  ForgotPassword: {
    code: string;
  };
  Test: Record<string, unknown>;
}

export type EmailSendMessageFunction<T = unknown> = (
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export class ConnectorError extends Error {}

export class ConnectorConfigError extends ConnectorError {}

export type ValidateConfig<T extends ConnectorConfig = ConnectorConfig> = (
  config: T
) => Promise<void>;
