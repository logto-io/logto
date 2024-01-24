import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

export const identifierRequiredConnectorMapping: {
  [key in SignInIdentifier]?: ConnectorType;
} = {
  [SignInIdentifier.Email]: ConnectorType.Email,
  [SignInIdentifier.Phone]: ConnectorType.Sms,
};
