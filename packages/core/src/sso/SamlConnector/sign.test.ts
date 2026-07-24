import { EnvSet } from '#src/env-set/index.js';
import { generateKeyPairAndCertificate } from '#src/libraries/saml-application/utils.js';

import { SamlAuthnRequestSignatureAlgorithm } from '../types/saml.js';

import SamlConnector from './index.js';

const setDevFeaturesEnabled = (enabled: boolean) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
};

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

// Minimal IdP metadata with a redirect SSO endpoint and a signing cert. Pass a namespace `prefix`
// (e.g. `md`, `saml-md`) to exercise prefixed elements; default is the un-prefixed default namespace.
const buildIdpMetadataXml = (cert: string, prefix = '') => {
  const body = cert
    .replace('-----BEGIN CERTIFICATE-----', '')
    .replace('-----END CERTIFICATE-----', '')
    .replaceAll(/\s/g, '');
  const tag = prefix ? `${prefix}:` : '';
  const namespace = prefix
    ? `xmlns:${prefix}="urn:oasis:names:tc:SAML:2.0:metadata"`
    : 'xmlns="urn:oasis:names:tc:SAML:2.0:metadata"';
  return `<?xml version="1.0"?>
<${tag}EntityDescriptor ${namespace} entityID="https://idp.example.com">
  <${tag}IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <${tag}KeyDescriptor use="signing"><KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#"><X509Data><X509Certificate>${body}</X509Certificate></X509Data></KeyInfo></${tag}KeyDescriptor>
    <${tag}SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/>
  </${tag}IDPSSODescriptor>
</${tag}EntityDescriptor>`;
};

describe('SamlConnector signed AuthnRequest', () => {
  const endpoint = new URL('https://logto.example.com');

  beforeEach(() => {
    setDevFeaturesEnabled(true);
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('omits Signature when signAuthnRequest is off', async () => {
    const { certificate } = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-1', {
      metadata: buildIdpMetadataXml(certificate),
    });
    const url = await connector.getSingleSignOnUrl('relay-1');
    expect(url).not.toContain('Signature=');
  });

  it('signs when enabled and a credential is set', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-2', {
      metadata: buildIdpMetadataXml(idp.certificate),
      signAuthnRequest: true,
      requestSignatureAlgorithm: SamlAuthnRequestSignatureAlgorithm.RsaSha256,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-2');
    expect(url).toContain('Signature=');
    expect(url).toContain('SigAlg=');
  });

  it('throws (fail-closed) when enabled with no credential', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-3', {
      metadata: buildIdpMetadataXml(idp.certificate),
      signAuthnRequest: true,
    });
    await expect(connector.getSingleSignOnUrl('relay-3')).rejects.toThrow();
  });

  it('stays unsigned when off despite metadata wanting it', async () => {
    // Regression: samlify throws ERR_METADATA_CONFLICT / "not private key" if the IdP advertises
    // WantAuthnRequestsSigned="true" while we send unsigned. Our flag drives both sides, so an
    // off connector yields a clean unsigned request regardless of the metadata.
    const { certificate } = await generateKeyPairAndCertificate(1);
    const metadata = buildIdpMetadataXml(certificate).replace(
      '<IDPSSODescriptor',
      '<IDPSSODescriptor WantAuthnRequestsSigned="true"'
    );
    const connector = new SamlConnector(endpoint, 'conn-4', { metadata });
    const url = await connector.getSingleSignOnUrl('relay-4');
    expect(url).not.toContain('Signature=');
  });

  it('signs on the manual-config path (no metadata XML)', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-5', {
      entityId: 'https://idp.example.com',
      signInEndpoint: 'https://idp.example.com/sso',
      x509Certificate: idp.certificate,
      signAuthnRequest: true,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-5');
    expect(url).toContain('Signature=');
  });

  it('uses the configured RSA-SHA512 algorithm', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-6', {
      metadata: buildIdpMetadataXml(idp.certificate),
      signAuthnRequest: true,
      requestSignatureAlgorithm: SamlAuthnRequestSignatureAlgorithm.RsaSha512,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-6');
    expect(url).toContain('rsa-sha512');
  });

  it('defaults to RSA-SHA256 when no algorithm is configured', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-7', {
      metadata: buildIdpMetadataXml(idp.certificate),
      signAuthnRequest: true,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-7');
    expect(url).toContain('rsa-sha256');
  });

  it('rewrites WantAuthnRequestsSigned="false" when enabled', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const metadata = buildIdpMetadataXml(idp.certificate).replace(
      '<IDPSSODescriptor',
      '<IDPSSODescriptor WantAuthnRequestsSigned="false"'
    );
    const connector = new SamlConnector(endpoint, 'conn-8', {
      metadata,
      signAuthnRequest: true,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-8');
    expect(url).toContain('Signature=');
  });

  it('throws when enabled and metadata has no IDPSSODescriptor', async () => {
    const sp = await generateKeyPairAndCertificate(1);
    const metadata =
      '<?xml version="1.0"?><EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com"></EntityDescriptor>';
    const connector = new SamlConnector(endpoint, 'conn-9', {
      metadata,
      signAuthnRequest: true,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    await expect(connector.getSingleSignOnUrl('relay-9')).rejects.toThrow();
  });

  it('signs when the IdP metadata uses a hyphenated namespace prefix', async () => {
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-11', {
      metadata: buildIdpMetadataXml(idp.certificate, 'saml-md'),
      signAuthnRequest: true,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-11');
    expect(url).toContain('Signature=');
  });

  it('does not sign when dev features are off', async () => {
    setDevFeaturesEnabled(false);
    const idp = await generateKeyPairAndCertificate(1);
    const sp = await generateKeyPairAndCertificate(1);
    const connector = new SamlConnector(endpoint, 'conn-10', {
      metadata: buildIdpMetadataXml(idp.certificate),
      signAuthnRequest: true,
    });
    connector.setServiceProviderSigningCredential({
      privateKey: sp.privateKey,
      certificate: sp.certificate,
    });
    const url = await connector.getSingleSignOnUrl('relay-10');
    expect(url).not.toContain('Signature=');
  });

  it('preserves the released mirror behavior when dev features are off', async () => {
    setDevFeaturesEnabled(false);
    // Released behavior mirrors the IdP metadata flag onto the SP, so an IdP advertising
    // WantAuthnRequestsSigned="true" makes samlify attempt to sign without a private key and
    // throw. The dev gate keeps that behavior (raw metadata, mirrored flag) until GA.
    const { certificate } = await generateKeyPairAndCertificate(1);
    const metadata = buildIdpMetadataXml(certificate).replace(
      '<IDPSSODescriptor',
      '<IDPSSODescriptor WantAuthnRequestsSigned="true"'
    );
    const connector = new SamlConnector(endpoint, 'conn-12', { metadata });
    await expect(connector.getSingleSignOnUrl('relay-12')).rejects.toThrow();
  });
});
