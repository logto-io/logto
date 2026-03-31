import { LogtoJwtTokenKeyType } from '@logto/schemas';

import { Action } from '../../CustomizeJwt/utils/type';

jest.mock('./config', () => ({
  defaultAccessTokenJwtCustomizerCode: 'default-access-script',
  defaultAccessTokenPayload: { sub: 'user-id' },
  defaultClientCredentialsJwtCustomizerCode: 'default-client-credentials-script',
  defaultClientCredentialsPayload: { client_id: 'client-id' },
  defaultM2mTokenContextData: { application: { id: 'app-id' } },
  defaultUserTokenContextData: { user: { id: 'user-id' } },
}));

import { formatResponseDataToFormData } from './format';

describe('formatResponseDataToFormData', () => {
  it('defaults blockIssuanceOnError to true when creating a new access token script', () => {
    const result = formatResponseDataToFormData(LogtoJwtTokenKeyType.AccessToken, Action.Create);

    expect(result.blockIssuanceOnError).toBe(true);
  });

  it('defaults blockIssuanceOnError to false when editing an existing access token script without the field', () => {
    const result = formatResponseDataToFormData(LogtoJwtTokenKeyType.AccessToken, Action.Edit, {
      script: 'return token;',
    });

    expect(result.blockIssuanceOnError).toBe(false);
  });

  it('preserves the backend blockIssuanceOnError value in create mode', () => {
    const result = formatResponseDataToFormData(
      LogtoJwtTokenKeyType.ClientCredentials,
      Action.Create,
      {
      script: 'return token;',
      blockIssuanceOnError: false,
      }
    );

    expect(result.blockIssuanceOnError).toBe(false);
  });

  it('preserves the backend blockIssuanceOnError value in edit mode', () => {
    const result = formatResponseDataToFormData(
      LogtoJwtTokenKeyType.ClientCredentials,
      Action.Edit,
      {
      script: 'return token;',
      blockIssuanceOnError: true,
      }
    );

    expect(result.blockIssuanceOnError).toBe(true);
  });
});
