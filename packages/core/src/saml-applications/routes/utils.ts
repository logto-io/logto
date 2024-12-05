import { parseJson } from '@logto/connector-kit';
import { generateStandardId } from '@logto/shared';
import camelcaseKeys from 'camelcase-keys';
import { got } from 'got';
import saml from 'samlify';

import RequestError from '#src/errors/RequestError/index.js';
import { oidcTokenResponseGuard, type idTokenProfileStandardClaims } from '#src/sso/types/oidc.js';

const createSamlTemplateCallback =
  (
    idp: saml.IdentityProviderInstance,
    sp: saml.ServiceProviderInstance,
    user: idTokenProfileStandardClaims
  ) =>
  (template: string) => {
    const assertionConsumerServiceUrl = sp.entityMeta.getAssertionConsumerService(
      saml.Constants.wording.binding.post
    );

    const { nameIDFormat } = idp.entitySetting;
    const selectedNameIDFormat = Array.isArray(nameIDFormat) ? nameIDFormat[0] : nameIDFormat;

    const id = `ID_${generateStandardId()}`;
    const now = new Date();
    const expireAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes later

    const tagValues = {
      ID: id,
      AssertionID: `ID_${generateStandardId()}`,
      Destination: assertionConsumerServiceUrl,
      Audience: sp.entityMeta.getEntityID(),
      EntityID: sp.entityMeta.getEntityID(),
      SubjectRecipient: assertionConsumerServiceUrl,
      Issuer: idp.entityMeta.getEntityID(),
      IssueInstant: now.toISOString(),
      AssertionConsumerServiceURL: assertionConsumerServiceUrl,
      StatusCode: 'urn:oasis:names:tc:SAML:2.0:status:Success',
      ConditionsNotBefore: now.toISOString(),
      ConditionsNotOnOrAfter: expireAt.toISOString(),
      SubjectConfirmationDataNotOnOrAfter: expireAt.toISOString(),
      NameIDFormat: selectedNameIDFormat,
      NameID: user.sub,
      InResponseTo: 'null',
      attrEmail: user.email,
      attrName: user.name,
    };

    const context = saml.SamlLib.replaceTagsByValue(template, tagValues);

    return {
      id,
      context,
    };
  };

export const exchangeAuthorizationCode = async (
  tokenEndpoint: string,
  {
    code,
    clientId,
    clientSecret,
    redirectUri,
  }: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
  }
) => {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const tokenRequestParameters = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    ...(redirectUri ? { redirect_uri: redirectUri } : {}),
  });

  const httpResponse = await got.post(tokenEndpoint, {
    body: tokenRequestParameters.toString(),
    headers,
  });

  const result = oidcTokenResponseGuard.safeParse(parseJson(httpResponse.body));

  if (!result.success) {
    throw new RequestError({
      code: 'oidc.invalid_token',
      message: 'Invalid token response',
    });
  }

  return camelcaseKeys(result.data);
};

export const createSamlResponse = async (
  idp: saml.IdentityProviderInstance,
  sp: saml.ServiceProviderInstance,
  userInfo: idTokenProfileStandardClaims
): Promise<{ context: string; entityEndpoint: string }> => {
  // TODO: fix binding method
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { context, entityEndpoint } = await idp.createLoginResponse(
    sp,
    // @ts-expect-error --fix request object later
    null,
    'post',
    userInfo,
    createSamlTemplateCallback(idp, sp, userInfo)
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return { context, entityEndpoint };
};

export const generateAutoSubmitForm = (actionUrl: string, samlResponse: string): string => {
  return `
    <html>
      <body>
        <form id="redirectForm" action="${actionUrl}" method="POST">
          <input type="hidden" name="SAMLResponse" value="${samlResponse}" />
          <input type="submit" value="Submit" /> 
        </form>
        <script>
          document.getElementById('redirectForm').submit();
        </script>
      </body>
    </html>
  `;
};
