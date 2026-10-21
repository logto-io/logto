import { NameIdFormat } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
import camelCase from 'camelcase';
import saml from 'samlify';

import RequestError from '#src/errors/RequestError/index.js';
import { type IdTokenProfileStandardClaims } from '#src/sso/types/oidc.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Determines the SAML NameID format and value based on the user's claims and IdP's NameID format.
 * Supports email and persistent formats.
 *
 * @param user - The user's standard claims
 * @param idpNameIDFormat - The NameID format(s) specified by the IdP (optional)
 * @returns An object containing the NameIDFormat and NameID
 */
export const buildSamlAssertionNameId = (
  user: IdTokenProfileStandardClaims,
  idpNameIDFormat: string[]
): { NameIDFormat: string; NameID: string } => {
  // Get the first name ID format
  const format = Array.isArray(idpNameIDFormat) ? idpNameIDFormat[0] : idpNameIDFormat;

  // If email format is specified, try to use email first
  if (format === NameIdFormat.EmailAddress) {
    assertThat(user.email, 'application.saml.missing_email_address');
    assertThat(user.email_verified, 'application.saml.email_address_unverified');
    return {
      NameIDFormat: format,
      NameID: user.email,
    };
  }

  // For persistent and unspecified formats, we use Logto user ID.
  if (format === NameIdFormat.Persistent || format === NameIdFormat.Unspecified) {
    return {
      NameIDFormat: format,
      NameID: user.sub,
    };
  }

  // For transient format, we generate a random ID.
  if (format === NameIdFormat.Transient) {
    return {
      NameIDFormat: format,
      NameID: generateStandardId(),
    };
  }

  throw new RequestError({
    code: 'application.saml.unsupported_name_id_format',
    details: { idpNameIDFormat, user },
  });
};

const escapeHtmlAttributeValue = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const safeActionUrlProtocols = Object.freeze(['http:', 'https:']);

// HTML-escaping the action attribute prevents markup breakouts but not scriptable schemes
// (e.g. `javascript:`), which the browser would execute on form submission.
const isSafeActionUrl = (actionUrl: string): boolean => {
  try {
    return safeActionUrlProtocols.includes(new URL(actionUrl).protocol);
  } catch {
    return false;
  }
};

export const generateAutoSubmitForm = (
  actionUrl: string,
  samlResponse: string,
  relayState?: string
): string => {
  assertThat(isSafeActionUrl(actionUrl), 'application.saml.acs_url_scheme_not_supported', 400);

  return `
    <html>
      <body>
        <form id="redirectForm" action="${escapeHtmlAttributeValue(actionUrl)}" method="POST">
          <input type="hidden" name="SAMLResponse" value="${escapeHtmlAttributeValue(
            samlResponse
          )}" />
          ${
            relayState
              ? `<input type="hidden" name="RelayState" value="${escapeHtmlAttributeValue(
                  relayState
                )}" />`
              : ''
          }
        </form>
        <script>
          window.onload = function() {
            document.getElementById('redirectForm').submit();
          };
        </script>
      </body>
    </html>
  `;
};

export const getSamlAppCallbackUrl = (baseUrl: URL, samlAppId: string) =>
  appendPath(baseUrl, `api/saml-applications/${samlAppId}/callback`);

/**
 * @desc Tag normalization, copied from https://github.com/tngan/samlify/blob/master/src/libsaml.ts#L230-L240 to get SAML attribute tag name.
 * @param {string} prefix     prefix of the tag
 * @param {content} content   normalize it to capitalized camel case
 * @return {string}
 */
export const generateSamlAttributeTag = (content: string, prefix = 'attr'): string => {
  const camelContent = camelCase(content, { locale: 'en-us' });
  return prefix + camelContent.charAt(0).toUpperCase() + camelContent.slice(1);
};

/**
 * Whether the service provider asked to re-authenticate the user, i.e. its `AuthnRequest` carries
 * `ForceAuthn="true"` (SAML 2.0 core, section 3.4.1; `xs:boolean` also admits `1`).
 *
 * samlify's default login-request extractor does not read this attribute, so it is read from the
 * decoded request XML.
 */
export const isForceAuthnRequested = (authnRequestXml: string): boolean => {
  const { forceAuthn } = saml.Extractor.extract(authnRequestXml, [
    { key: 'forceAuthn', localPath: ['AuthnRequest'], attributes: ['ForceAuthn'] },
  ]);

  // Xs:boolean collapses XML whitespace, not arbitrary Unicode whitespace.
  const value =
    typeof forceAuthn === 'string'
      ? forceAuthn.replaceAll(/^[\t\n\r ]+|[\t\n\r ]+$/g, '')
      : forceAuthn;
  return value === 'true' || value === '1';
};

/** Preserve the raw URL encoding and canonical parameter order required by HTTP-Redirect signatures. */
export const getSamlRedirectSignatureInput = (querystring: string): string => {
  const parameters = querystring.split('&');
  return ['SAMLRequest', 'RelayState', 'SigAlg']
    .map((name) => parameters.find((parameter) => parameter.startsWith(`${name}=`)))
    .filter(Boolean)
    .join('&');
};

/** SAML POST signatures must cover the enclosing AuthnRequest, not a different XML element. */
export const assertSamlAuthnRequestSignatureScope = (xml: string): void => {
  const { id, signature, assertion } = saml.Extractor.extract(xml, [
    { key: 'id', localPath: ['AuthnRequest'], attributes: ['ID'] },
    { key: 'signature', localPath: ['AuthnRequest', 'Signature'], attributes: [], context: true },
    { key: 'assertion', localPath: ['AuthnRequest', 'Assertion'], attributes: [], context: true },
  ]);
  assertThat(
    typeof id === 'string' && id.length > 0 && typeof signature === 'string' && !assertion,
    'application.saml.invalid_saml_request'
  );
  const { reference } = saml.Extractor.extract(signature, [
    {
      key: 'reference',
      localPath: ['Signature', 'SignedInfo', 'Reference'],
      attributes: [],
      context: true,
    },
  ]);
  assertThat(typeof reference === 'string', 'application.saml.invalid_saml_request');
  const { uri } = saml.Extractor.extract(reference, [
    { key: 'uri', localPath: ['Reference'], attributes: ['URI'] },
  ]);
  assertThat(uri === `#${id}`, 'application.saml.invalid_saml_request');
};
