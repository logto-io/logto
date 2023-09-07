import { type SnakeCaseOidcConfig } from '@logto/schemas';
import { useContext } from 'react';
import useSWR from 'swr';

import { GuideContext } from '@/components/Guide';
import { openIdProviderConfigPath } from '@/consts/oidc';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { type RequestError } from '@/hooks/use-api';

export default function EnvironmentVariables() {
  const { app } = useContext(GuideContext);
  const { id, secret } = app ?? {};
  const { data } = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);
  const authorizationEndpoint = data?.authorization_endpoint ?? '[LOADING]';
  const tokenEndpoint = data?.token_endpoint ?? '[LOADING]';
  const userinfoEndpoint = data?.userinfo_endpoint ?? '[LOADING]';

  return (
    <table>
      <thead>
        <tr>
          <th>Outline Environment Variable</th>
          <th>Logto Display Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {id && (
          <tr>
            <td>OIDC_CLIENT_ID</td>
            <td>App ID</td>
            <td>
              <CopyToClipboard value={id} />
            </td>
          </tr>
        )}
        {secret && (
          <tr>
            <td>OIDC_CLIENT_SECRET</td>
            <td>App secret</td>
            <td>
              <CopyToClipboard value={secret} />
            </td>
          </tr>
        )}
        <tr>
          <td>OIDC_AUTH_URI</td>
          <td>Authorization endpoint</td>
          <td>
            <CopyToClipboard value={authorizationEndpoint} />
          </td>
        </tr>
        <tr>
          <td>OIDC_TOKEN_URI</td>
          <td>Token endpoint</td>
          <td>
            <CopyToClipboard value={tokenEndpoint} />
          </td>
        </tr>
        <tr>
          <td>OIDC_USERINFO_URI</td>
          <td>Userinfo endpoint</td>
          <td>
            <CopyToClipboard value={userinfoEndpoint} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
