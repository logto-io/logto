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

const createSamlApp = (overrides: Parameters<typeof createMockSamlApplicationDetails>[0] = {}) =>
  new TestSamlApplication(
    createMockSamlApplicationDetails(overrides),
    'saml-app-id',
    createMockSamlEnvSet({ issuer: 'https://issuer.example.com' })
  );

const getAttributeNames = (samlApp: TestSamlApplication) =>
  samlApp.exposedBuildLoginResponseTemplate().attributes.map(({ name }) => name);

describe('SamlApplication static attributes', () => {
  it('keeps the fallback attributes when nothing is configured', () => {
    expect(getAttributeNames(createSamlApp())).toEqual(['sub', 'email', 'name']);
  });

  it('appends static attributes after the fallback attributes', () => {
    expect(getAttributeNames(createSamlApp({ staticAttributes: { site: '2' } }))).toEqual([
      'sub',
      'email',
      'name',
      'site',
    ]);
  });

  it('appends static attributes after the mapped attributes', () => {
    const samlApp = createSamlApp({
      attributeMapping: { email: 'emailAddress' },
      staticAttributes: { site: '2', account: 'acct-1' },
    });

    expect(getAttributeNames(samlApp)).toEqual(['emailAddress', 'site', 'account']);
  });

  it('fills static attribute values in the samlify attribute statement', () => {
    const samlApp = createSamlApp({ staticAttributes: { site: '2', ns1account: 'acct-1' } });
    const statement = saml.SamlLib.attributeStatementBuilder(
      samlApp.exposedBuildLoginResponseTemplate().attributes
    );

    const { context } = samlApp.exposedCreateSamlTemplateCallback({
      userInfo: { sub: 'user123', auth_time: 1_700_000_000, email: 'user@example.com' },
      samlRequestId: null,
      sessionId: undefined,
      sessionExpiresAt: undefined,
    })(statement);

    expect(context).toContain('>2</saml:AttributeValue>');
    expect(context).toContain('>acct-1</saml:AttributeValue>');
    expect(context).toContain('>user@example.com</saml:AttributeValue>');
    expect(context).not.toContain('{attr');
  });
});
