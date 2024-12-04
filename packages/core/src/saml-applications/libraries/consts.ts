export const samlLogInResponseTemplate = `
<Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="{ID}" Version="2.0" IssueInstant="{IssueInstant}" Destination="{Destination}" InResponseTo="{InResponseTo}">
  <Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">{Issuer}</Issuer>
  <Status>
    <StatusCode Value="{StatusCode}"/>
  </Status>
  <Assertion ID="{AssertionID}" Version="2.0" IssueInstant="{IssueInstant}" xmlns="urn:oasis:names:tc:SAML:2.0:assertion">
    <Issuer>{Issuer}</Issuer>
    <Subject>
      <NameID Format="{NameIDFormat}">{NameID}</NameID>
      <SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <SubjectConfirmationData NotOnOrAfter="{SubjectConfirmationDataNotOnOrAfter}" Recipient="{SubjectRecipient}" InResponseTo="{InResponseTo}"/>
      </SubjectConfirmation>
    </Subject>
    <Conditions NotBefore="{ConditionsNotBefore}" NotOnOrAfter="{ConditionsNotOnOrAfter}">
      <AudienceRestriction>
        <Audience>{Audience}</Audience>
      </AudienceRestriction>
    </Conditions>
    <AuthnStatement AuthnInstant="{IssueInstant}">
      <AuthnContext>
        <AuthnContextClassRef>{AuthnContextClassRef}</AuthnContextClassRef>
      </AuthnContext>
    </AuthnStatement>
    {AttributeStatement}
  </Assertion>
</Response>`;

export const samlAttributeNameFormatBasic = 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic';

const samlValueXmlnsXsiString = 'xs:string';
const samlValueXmlnsXsiInteger = 'xsd:integer';
const samlValueXmlnsXsiBoolean = 'xsd:boolean';
const samlValueXmlnsXsiDatetime = 'xsd:dateTime';

export const samlValueXmlnsXsi = {
  string: samlValueXmlnsXsiString,
  integer: samlValueXmlnsXsiInteger,
  boolean: samlValueXmlnsXsiBoolean,
  datetime: samlValueXmlnsXsiDatetime,
};
