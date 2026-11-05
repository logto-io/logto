import saml from 'samlify';

import {
  createMockSamlApplicationDetails,
  createMockSamlEnvSet,
} from './__mocks__/saml-application.js';
import { SamlApplication } from './index.js';

class TestSamlApplication extends SamlApplication {
  public exposedCreateSamlTemplateCallback = this.createSamlTemplateCallback;
  public exposedBuildLoginResponseTemplate = this.buildLoginResponseTemplate;
}

const mockUser = {
  sub: 'user123',
  auth_time: 1_700_000_000,
  email: 'user@example.com',
  name: 'Test User',
};

const createSamlApp = (overrides: Parameters<typeof createMockSamlApplicationDetails>[0] = {}) =>
  new TestSamlApplication(
    createMockSamlApplicationDetails(overrides),
    'saml-app-id',
    createMockSamlEnvSet({ issuer: 'https://issuer.example.com' })
  );

const buildContext = (samlApp: TestSamlApplication, userInfo: Record<string, unknown>) => {
  const statement = saml.SamlLib.attributeStatementBuilder(
    samlApp.exposedBuildLoginResponseTemplate().attributes
  );

  return samlApp.exposedCreateSamlTemplateCallback({
    userInfo: userInfo as typeof mockUser,
    samlRequestId: null,
    sessionId: undefined,
    sessionExpiresAt: undefined,
  })(statement).context;
};

const valueElement = (value: string) =>
  `<saml:AttributeValue xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">${value}</saml:AttributeValue>`;

describe('SamlApplication multi-valued attributes', () => {
  it('emits one AttributeValue per item of a multi-valued claim', () => {
    const samlApp = createSamlApp({ attributeMapping: { roles: 'role', name: 'name' } });

    const context = buildContext(samlApp, { ...mockUser, roles: ['Development', 'Employees'] });

    expect(context).toContain(
      `<saml:Attribute Name="role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">${valueElement('Development')}${valueElement('Employees')}</saml:Attribute>`
    );
    expect(context).toContain(`${valueElement('Test User')}</saml:Attribute>`);
    expect(context).not.toContain('[');
  });

  it('keeps object items of a multi-valued claim JSON-encoded', () => {
    const samlApp = createSamlApp({
      attributeMapping: { organization_data: 'organizations', name: 'name' },
    });

    const context = buildContext(samlApp, {
      ...mockUser,
      organization_data: [
        { id: 'org-1', name: 'Org 1', description: null },
        { id: 'org-2', name: 'Org 2', description: null },
      ],
    });

    const [, organizationsAttribute] =
      /<saml:Attribute Name="organizations"[^>]*>(.*?)<\/saml:Attribute>/.exec(context) ?? [];
    const valueElements = organizationsAttribute?.match(/<saml:AttributeValue/g) ?? [];

    expect(valueElements).toHaveLength(2);
    expect(organizationsAttribute).not.toContain('[object Object]');
    expect(organizationsAttribute).toContain('org-1');
    expect(organizationsAttribute).toContain('org-2');
  });
});
