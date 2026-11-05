import { NameIdFormat, type SamlAttributeMapping } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { appendPath, type Nullable } from '@silverhand/essentials';
import saml from 'samlify';

import RequestError from '#src/errors/RequestError/index.js';
import { type IdTokenProfileStandardClaims } from '#src/sso/types/oidc.js';
import assertThat from '#src/utils/assert-that.js';

import { fallbackAttributes } from './consts.js';

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
 * Get the template tag samlify fills with an attribute value: `prefix` followed by `content` in
 * capitalized camel case. It must equal samlify's `tagging` output, otherwise samlify leaves the
 * `{attr…}` placeholder in the assertion. samlify does not expose `tagging` or its `camelCase`
 * publicly, so both are mirrored here.
 *
 * @see {@link https://github.com/tngan/samlify/blob/v2.13.1/src/utility.ts | samlify `camelCase`}
 */
export const generateSamlAttributeTag = (content: string, prefix = 'attr'): string => {
  const camelContent = content
    .replaceAll(/([\da-z])([A-Z])/g, '$1\0$2')
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, '$1\0$2')
    .split(/[\s\0._-]+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLocaleLowerCase('en-US');
      return index === 0 ? lower : lower.charAt(0).toLocaleUpperCase('en-US') + lower.slice(1);
    })
    .join('');
  return prefix + camelContent.charAt(0).toUpperCase() + camelContent.slice(1);
};

/** A value samlify substitutes for a template tag. */
export type SamlTagValue = Nullable<string | number> | undefined;

const escapeRegExp = (value: string) => value.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');

/**
 * Expand the `<saml:AttributeValue>` element of every array-valued tag into one element per item,
 * so a multi-valued claim such as `roles` is emitted as sibling values (SAML core 2.7.3.1) rather
 * than one JSON-encoded string. The array is replaced by per-item tags (`{attrRole:0}`, …). When
 * the template has no value element for the tag, the array is kept as a JSON string so a custom
 * template keeps its previous output.
 */
export const expandMultiValuedAttributeTags = (
  template: string,
  tagValues: Record<string, SamlTagValue | SamlTagValue[]>
): { template: string; tagValues: Record<string, SamlTagValue> } =>
  Object.entries(tagValues).reduce<{ template: string; tagValues: Record<string, SamlTagValue> }>(
    (expanded, [tag, value]) => {
      if (!Array.isArray(value)) {
        return { ...expanded, tagValues: { ...expanded.tagValues, [tag]: value } };
      }

      const items = value.map((item, index) => [`${tag}:${index}`, item] as const);
      const expandedTemplate = expanded.template.replaceAll(
        new RegExp(
          `<saml:AttributeValue([^>]*)>\\{${escapeRegExp(tag)}\\}</saml:AttributeValue>`,
          'g'
        ),
        (_, attributes: string) =>
          items
            .map(
              ([itemTag]) => `<saml:AttributeValue${attributes}>{${itemTag}}</saml:AttributeValue>`
            )
            .join('')
      );

      if (expandedTemplate === expanded.template) {
        return { ...expanded, tagValues: { ...expanded.tagValues, [tag]: JSON.stringify(value) } };
      }

      return {
        template: expandedTemplate,
        tagValues: { ...expanded.tagValues, ...Object.fromEntries(items) },
      };
    },
    { template, tagValues: {} }
  );

/** Names of the user attributes in the assertion; `fallbackAttributes` apply when nothing is mapped. */
export const getSamlUserAttributeNames = (attributeMapping: SamlAttributeMapping): string[] =>
  Object.keys(attributeMapping).length > 0 ? Object.values(attributeMapping) : fallbackAttributes;

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
