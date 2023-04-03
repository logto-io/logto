# SAML connector


## Get started

SAML (Security Assertion Markup Language) is an open standard for exchanging authentication and authorization data between parties, in particular, between an identity provider (IdP) and a service provider (SP). It allows users to authenticate with one system and then access resources in another system without having to re-enter their credentials. SAML is commonly used in enterprise environments and in federation scenarios, where multiple organizations need to share user authentication and authorization information.

Logto serve as a SP and SAML connector help to build bridges between Logto and SAML IdPs, as a result, end-users should be able to take advantage of SAML IdPs to sign in to Logto account.

## Create social IdP's account and register SAML application (IdP)

Let's go through configurations of SAML connector.

Before we kicking off, you can go to a social identity provider which supports SAML protocol and create your own account. Okta, OneLogin, Salesforce and some other platforms support authentication based on SAML protocol.

If your IdP mandate the encryption of SAML assertion and receiving of signed authentication requests, you should generate your private key and corresponding certificate using RSA algorithm. Keep the private key for your SP use and upload the certificate to IdP.

You also need to configure the ACS (Assertion Consumer Service) URL as `${your_logto_origin}/api/authn/saml/${connector_id}` to handle IdP's SAML assertion. Where you can find your `connectorId` at SAML connector's details page in Logto's Admin Console.

> ℹ️ **Note**
> 
> Per current Logto's design, we only support Redirect-binding for sending authentication request and POST-binding for receiving SAML assertion. Although this sounds not cool, but we believe that the current design can handle most of your use cases. If you have any problems, feel free to reach out!

## Configure SAML connector (SP)

In this section, we will introduce each attribute in detail.

### entityID `Required`

`entityID` (i.e. `issuer`) is Entity identifier. It is used to identify your entity (SAML SP entity), and match the equivalence in each SAML request/response.

### signInEndpoint `Required`

The IdP's endpoint that you send SAML authentication requests to. Usually, you can find this value in IdP details page (i.e. IdP's `SSO URL` or `Login URL`).

### x509Certificate `Required`

The x509 certificate generated from IdPs private key, IdP is expected to have this value available.

The content of the certificate comes with `-----BEGIN CERTIFICATE-----` header and `-----END CERTIFICATE-----` tail.

### idpMetadataXml `Required`

The field is used to place contents from your IdP metadata XML file.

> ℹ️ **Note**
> 
> The XML parser we are using does not support customized namespace.
> If the IdP metadata comes with namespace, you should manually remove them.
> For namespace of XML file, see [reference](http://www.xmlmaster.org/en/article/d01/c10/).

### assertionConsumerServiceUrl `Required`

The assertion consumer service (ACS) URL is the SP's endpoint to receive IdP's SAML Assertion POST requests. As we mentioned in previous part, it is usually configured at IdP settings but some IdP get this value from SAML authentication requests, we hence also add this value as a REQUIRED field. It's value should look like `${your_logto_origin}/api/authn/saml/${connector_id}`.

### signAuthnRequest

The boolean value that controls whether SAML authentication request should be signed, whose default value is `false`.

### encryptAssertion

`encryptAssertion` is a boolean value that indicates if IdP will encrypt SAML assertion, with default value `false`.

> ℹ️ **Note**
> 
> `signAuthnRequest` and `encryptAssertion` attributes should align with corresponding parameters of IdP setting, otherwise error will be thrown to show that configuration does not match.
> All SAML responses need to be signed.

### requestSignatureAlgorithm

This should be aligned with the signature algorithms of IdP so that Logto can verify the signature of the SAML assertion. Its value should be either `http://www.w3.org/2000/09/xmldsig#rsa-sha1`, `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256` or `http://www.w3.org/2001/04/xmldsig-more#rsa-sha512` and the default value is `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256`.

### messageSigningOrder

`messageSigningOrder` indicates the signing and encrypting order of IdP, it's value should be either `sign-then-encrypt` or `encrypt-then-sign` and the default value is `sign-then-encrypt`.

### privateKey and privateKeyPass

`privateKey` is an OPTIONAL value and is required when `signAuthnRequest` is `true`.

`privateKeyPass` is the password you've set when creating `privateKey`, required when necessary.

If `signAuthnRequest` is `true`, the corresponding certificate generated from `privateKey` is required by IdP for checking the signature.

### encPrivateKey and encPrivateKeyPass

`encPrivateKey` is an OPTIONAL value and is required when `encryptAssertion` is `true`.

`encPrivateKeyPass` is the password you've set when creating `encPrivateKey`, required when necessary.

If `encryptAssertion` is `true`, the corresponding certificate generated from `encPrivateKey` is required by IdP for encrypting SAML assertion.

> ℹ️ **Note**
> 
> For keys and certificates generation, `openssl` is a wonderful tool. Here is sample command line that might be helpful:
> 
> ```bash
> openssl genrsa -passout pass:${privateKeyPassword} -out ${encryptPrivateKeyFilename}.pem 4096
> openssl req -new -x509 -key ${encryptPrivateKeyFilename}.pem -out ${encryptionCertificateFilename}.cer -days 3650
> ```
>
> `privateKey` and `encPrivateKey` files are enforced to be encoded in `pkcs1` scheme as pem string, which means the private key files should start with `-----BEGIN RSA PRIVATE KEY-----` and end with `-----END RSA PRIVATE KEY-----`.

### nameIDFormat

`nameIDFormat` is an OPTIONAL attribute that declares the name id format that would respond. The value can be among `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified`, `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`, `urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName`, `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` and `urn:oasis:names:tc:SAML:2.0:nameid-format:transient`, and the default value is `urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified`.

### timeout

`timeout` is the time tolerance for time validation, since the time between your SP entity and IdP entity could be different and network connection may also bring some delay. The unit is in millisecond, and the default value is 5000 (i.e. 5s).

### profileMap

Logto also provide a `profileMap` field that users can customize the mapping from the social vendors' profiles which are usually not standard. Each `profileMap` keys is Logto's standard user profile field name and corresponding value should be social profiles field name. In current stage, Logto only concern 'id', 'name', 'avatar', 'email' and 'phone' from social profile, only 'id' is REQUIRED and others are optional fields.

### Config types

| Name                        | Type       | Required | Default Value |
|-----------------------------|------------|----------|---------------|
| signInEndpoint              | string     | true     |               |
| x509certificate             | string     | true     |               |
| idpMetadataXml              | string     | true     |               |
| entityID                    | string     | true     |               |
| assertionConsumerServiceUrl | string     | true     |               |
| messageSigningOrder         | `encrypt-then-sign` \| `sign-then-encrypt` | false | `sign-then-encrypt` |
| requestSignatureAlgorithm   | `http://www.w3.org/2000/09/xmldsig#rsa-sha1` \| `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256` \| `http://www.w3.org/2001/04/xmldsig-more#rsa-sha512` | false | `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256` |
| signAuthnRequest            | boolean    | false    | false         |
| encryptAssertion            | boolean    | false    | false         |
| privateKey                  | string     | false    |               |
| privateKeyPass              | string     | false    |               |
| nameIDFormat                | `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` \| `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` \| `urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName` \| `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` \| `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` | false | `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` |
| timeout                     | number     | false    | 5000          |
| profileMap                  | ProfileMap | false    |               |

| ProfileMap fields | Type   | Required | Default value |
|-------------------|--------|----------|---------------|
| id                | string | false    | id            |
| name              | string | false    | name          |
| avatar            | string | false    | avatar        |
| email             | string | false    | email         |
| phone             | string | false    | phone         |

## Reference

* [Profiles for the OASIS Security Assertion Markup Language (SAML) V2.0](http://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf)
* [samlify - Highly configuarable Node.js SAML 2.0 library for Single Sign On](https://github.com/tngan/samlify)
