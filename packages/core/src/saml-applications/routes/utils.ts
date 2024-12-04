import { generateStandardId } from '@logto/shared';
import saml from 'samlify';

import { type idTokenProfileStandardClaims } from '#src/sso/types/oidc.js';

export const samlLogInResponseTemplate = `
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="{ID}" Version="2.0" IssueInstant="{IssueInstant}" Destination="{Destination}" InResponseTo="{InResponseTo}">
  <saml:Issuer>{Issuer}</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="{StatusCode}"/>
  </samlp:Status>
  <saml:Assertion ID="{AssertionID}" Version="2.0" IssueInstant="{IssueInstant}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    <saml:Issuer>{Issuer}</saml:Issuer>
    <saml:Subject>
      <saml:NameID Format="{NameIDFormat}">{NameID}</saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <saml:SubjectConfirmationData NotOnOrAfter="{SubjectConfirmationDataNotOnOrAfter}" Recipient="{SubjectRecipient}" InResponseTo="{InResponseTo}"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="{ConditionsNotBefore}" NotOnOrAfter="{ConditionsNotOnOrAfter}">
      <saml:AudienceRestriction>
        <saml:Audience>{Audience}</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    {AttributeStatement}
  </saml:Assertion>
</samlp:Response>`;

export const createSamlTemplateCallback =
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
