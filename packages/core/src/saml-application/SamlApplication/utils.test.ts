import { NameIdFormat } from '@logto/schemas';

import { generateAutoSubmitForm, buildSamlAssertionNameId } from './utils.js';

describe('buildSamlAssertionNameId', () => {
  it('should use email when email_verified is true', () => {
    const user = {
      sub: 'user123',
      email: 'user@example.com',
      email_verified: true,
    };

    const result = buildSamlAssertionNameId(user, [NameIdFormat.EmailAddress]);

    expect(result).toEqual({
      NameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      NameID: user.email,
    });
  });

  it('should use sub when email is not verified', () => {
    const user = {
      sub: 'user123',
      email: 'user@example.com',
      email_verified: false,
    };

    const result = buildSamlAssertionNameId(user, [NameIdFormat.Persistent]);

    expect(result).toEqual({
      NameIDFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      NameID: user.sub,
    });
  });

  it('should use sub when email is not available', () => {
    const user = {
      sub: 'user123',
    };

    const result = buildSamlAssertionNameId(user, [NameIdFormat.Persistent]);

    expect(result).toEqual({
      NameIDFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      NameID: user.sub,
    });
  });

  it('should use specified format when provided', () => {
    const user = {
      sub: 'user123',
      email: 'user@example.com',
      email_verified: false,
    };
    const format = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent';

    const result = buildSamlAssertionNameId(user, [format]);

    expect(result).toEqual({
      NameIDFormat: format,
      NameID: user.sub,
    });
  });
});

describe('generateAutoSubmitForm', () => {
  it('should generate valid HTML form with auto-submit script', () => {
    const actionUrl = 'https://example.com/acs';
    const samlResponse = 'base64EncodedSamlResponse';

    const result = generateAutoSubmitForm(actionUrl, samlResponse);

    expect(result).toContain('<html>');
    expect(result).toContain('<body>');
    expect(result).toContain('</html>');

    expect(result).toContain(`<form id="redirectForm" action="${actionUrl}" method="POST">`);
    expect(result).toContain(`<input type="hidden" name="SAMLResponse" value="${samlResponse}" />`);

    expect(result).toContain('window.onload = function()');
    expect(result).toContain("document.getElementById('redirectForm').submit()");
  });

  it('should properly escape special characters in URLs and values', () => {
    const actionUrl = 'https://example.com/acs?param=value&other=123';
    const samlResponse = 'response+with/special=characters&';

    const result = generateAutoSubmitForm(actionUrl, samlResponse);

    expect(result).toContain('action="https://example.com/acs?param=value&other=123"');
    expect(result).toContain('value="response+with/special=characters&"');
  });
});
