import { type SnakeCaseOidcConfig } from '@logto/schemas';
import useSWR from 'swr';

import { openIdProviderConfigPath } from '@/consts/oidc';
import CodeEditor from '@/ds-components/CodeEditor';
import { type RequestError } from '@/hooks/use-api';

export default function AiPluginJson() {
  const { data } = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);
  const authorizationEndpoint = data?.authorization_endpoint ?? '[LOADING]';
  const authorizationUrl = data?.token_endpoint ?? '[LOADING]';

  return (
    <CodeEditor
      isReadonly
      language="json"
      value={`"auth": {
  "type": "oauth",
  "client_url": "${authorizationEndpoint}",
  "scope": "profile", // A placeholder scope, to make sure the \`scope\` parameter is not empty
  "authorization_url": "${authorizationUrl}",
  "authorization_content_type": "application/json",
  "verification_tokens": {
    "openai": "Replace_this_string_with_the_verification_token_generated_in_the_ChatGPT_UI"
  }
}`}
    />
  );
}
