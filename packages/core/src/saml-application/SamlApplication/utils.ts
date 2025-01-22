import { NameIdFormat } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
import camelCase from 'camelcase';

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

export const generateAutoSubmitForm = (actionUrl: string, samlResponse: string): string => {
  return `
    <html>
      <body>
        <form id="redirectForm" action="${actionUrl}" method="POST">
          <input type="hidden" name="SAMLResponse" value="${samlResponse}" />
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
