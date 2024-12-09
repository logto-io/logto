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
