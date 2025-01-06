// TODO: refactor this file to reduce LOC
import saml from 'samlify';

import { type IdTokenProfileStandardClaims } from '#src/sso/types/oidc.js';

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
  idpNameIDFormat?: string | string[]
): { NameIDFormat: string; NameID: string } => {
  if (idpNameIDFormat) {
    // Get the first name ID format
    const format = Array.isArray(idpNameIDFormat) ? idpNameIDFormat[0] : idpNameIDFormat;
    // If email format is specified, try to use email first
    if (
      format === saml.Constants.namespace.format.emailAddress &&
      user.email &&
      user.email_verified
    ) {
      return {
        NameIDFormat: format,
        NameID: user.email,
      };
    }
    // For other formats or when email is not available, use sub
    if (format === saml.Constants.namespace.format.persistent) {
      return {
        NameIDFormat: format,
        NameID: user.sub,
      };
    }
  }
  // No nameIDFormat specified, use default logic
  // Use email if available
  if (user.email && user.email_verified) {
    return {
      NameIDFormat: saml.Constants.namespace.format.emailAddress,
      NameID: user.email,
    };
  }
  // Fallback to persistent format with user.sub
  return {
    NameIDFormat: saml.Constants.namespace.format.persistent,
    NameID: user.sub,
  };
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
