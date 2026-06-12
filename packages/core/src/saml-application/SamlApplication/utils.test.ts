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

    expect(result).toContain('action="https://example.com/acs?param=value&amp;other=123"');
    expect(result).toContain('value="response+with/special=characters&amp;"');
  });

  it('should include RelayState field when relayState is provided', () => {
    const actionUrl = 'https://example.com/acs';
    const samlResponse = 'base64EncodedSamlResponse';
    const relayState = 'some-relay-state-value';

    const result = generateAutoSubmitForm(actionUrl, samlResponse, relayState);

    expect(result).toContain(`<input type="hidden" name="SAMLResponse" value="${samlResponse}" />`);
    expect(result).toContain(`<input type="hidden" name="RelayState" value="${relayState}" />`);
  });

  it('should not include RelayState field when relayState is not provided', () => {
    const actionUrl = 'https://example.com/acs';
    const samlResponse = 'base64EncodedSamlResponse';

    const result = generateAutoSubmitForm(actionUrl, samlResponse);

    expect(result).toContain(`<input type="hidden" name="SAMLResponse" value="${samlResponse}" />`);
    expect(result).not.toContain('name="RelayState"');
  });

  it('should properly escape special characters in relayState', () => {
    const actionUrl = 'https://example.com/acs';
    const samlResponse = 'base64EncodedSamlResponse';
    const relayState = 'relay+state/with&special=characters';

    const result = generateAutoSubmitForm(actionUrl, samlResponse, relayState);

    expect(result).toContain(
      '<input type="hidden" name="RelayState" value="relay+state/with&amp;special=characters" />'
    );
  });

  it('should html-escape double quotes in relayState so the attribute value is not truncated', () => {
    // Some SPs (e.g. HubSpot membership SSO) send a JSON string as RelayState. Without
    // escaping, the attribute value is cut off at the first inner double quote and the
    // SP receives only `{`.
    const actionUrl = 'https://example.com/acs';
    const samlResponse = 'base64EncodedSamlResponse';
    const relayState = '{"pageId":12345,"redirectUrl":"https://example.com/private"}';

    const result = generateAutoSubmitForm(actionUrl, samlResponse, relayState);

    expect(result).toContain(
      '<input type="hidden" name="RelayState" value="{&quot;pageId&quot;:12345,&quot;redirectUrl&quot;:&quot;https://example.com/private&quot;}" />'
    );
  });

  it('should html-escape markup characters in samlResponse and relayState', () => {
    const actionUrl = 'https://example.com/acs';
    const samlResponse = '<script>alert(1)</script>';
    const relayState = `'"><img src=x onerror=alert(1)>`;

    const result = generateAutoSubmitForm(actionUrl, samlResponse, relayState);

    expect(result).not.toContain('<script>alert(1)</script>');
    expect(result).not.toContain('<img');
    expect(result).toContain('value="&lt;script&gt;alert(1)&lt;/script&gt;"');
    expect(result).toContain('value="&#39;&quot;&gt;&lt;img src=x onerror=alert(1)&gt;"');
  });

  it('should html-escape quotes and markup in the action URL', () => {
    const actionUrl = `https://example.com/acs?redirect="><script>alert(1)</script>`;
    const samlResponse = 'base64EncodedSamlResponse';

    const result = generateAutoSubmitForm(actionUrl, samlResponse);

    expect(result).not.toContain('"><script>');
    expect(result).toContain(
      'action="https://example.com/acs?redirect=&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"'
    );
  });

  it('should reject action URLs with a non-http(s) scheme', () => {
    const samlResponse = 'base64EncodedSamlResponse';

    // eslint-disable-next-line no-script-url -- deliberately asserting a `javascript:` URL is rejected
    expect(() => generateAutoSubmitForm('javascript:alert(1)', samlResponse)).toThrowError();
    expect(() =>
      generateAutoSubmitForm('data:text/html,<script>alert(1)</script>', samlResponse)
    ).toThrowError();
    expect(() => generateAutoSubmitForm('not-a-url', samlResponse)).toThrowError();
  });

  it('should allow http and https action URLs', () => {
    const samlResponse = 'base64EncodedSamlResponse';

    expect(() => generateAutoSubmitForm('http://example.com/acs', samlResponse)).not.toThrowError();
    expect(() =>
      generateAutoSubmitForm('https://example.com/acs', samlResponse)
    ).not.toThrowError();
  });
});
