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

### SP Entity ID (Audience) `Required`

`SP Entity ID (Audience)` (i.e. `issuer`) is Entity identifier. It is used to identify your entity (SAML SP entity), and match the equivalence in each SAML request/response.

### IdP Single Sign-On URL

The IdP's endpoint that you send SAML authentication requests to. Usually, you can find this value in IdP details page (i.e. IdP's `SSO URL` or `Login URL`).

### X.509 Certificate `Required`

The x509 certificate generated from IdPs private key, IdP is expected to have this value available.

The content of the certificate comes with `-----BEGIN CERTIFICATE-----` header and `-----END CERTIFICATE-----` tail.

### IdP's Metadata in XML format `Required`

The field is used to place contents from your IdP metadata XML file.

> ℹ️ **Note**
>
> The XML parser we are using does not support customized namespace.
> If the IdP metadata comes with namespace, you should manually remove them.
> For namespace of XML file, see [reference](http://www.xmlmaster.org/en/article/d01/c10/).

### Assertion Consumer Service URL `Required`

The assertion consumer service (ACS) URL is the SP's endpoint to receive IdP's SAML Assertion POST requests. As we mentioned in previous part, it is usually configured at IdP settings but some IdP get this value from SAML authentication requests, we hence also add this value as a REQUIRED field. It's value should look like `${your_logto_origin}/api/authn/saml/${connector_id}`.

### Signature Algorithm

This should be aligned with the signature algorithms of IdP so that Logto can verify the signature of the SAML assertion. Its value should be either `http://www.w3.org/2000/09/xmldsig#rsa-sha1`, `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256` or `http://www.w3.org/2001/04/xmldsig-more#rsa-sha512` and the default value is `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256`.

### Message Signing Order

`Message Signing Order` indicates the signing and encrypting order of IdP, it's value should be either `sign-then-encrypt` or `encrypt-then-sign` and the default value is `sign-then-encrypt`.

### Sign Authentication Request

The boolean value that controls whether SAML authentication request should be signed, whose default value is `false`.

### SAML Assertion Encrypted

`SAML Assertion Encrypted` is a boolean value that indicates if IdP will encrypt SAML assertion, with default value `false`.

> ℹ️ **Note**
>
> `Sign Authentication Request` and `SAML Assertion Encrypted` attributes should align with corresponding parameters of IdP setting, otherwise error will be thrown to show that configuration does not match.
> All SAML responses need to be signed.

### 'Signature Private Key' and 'Signature Private Key Password'

`Signature Private Key` is an OPTIONAL value and is required when `Sign Authentication Request` is `true`.

`Signature Private Key Password` is the password you've set when creating `Signature Private Key`, required when necessary.

If `Sign Authentication Request` is `true`, the corresponding certificate generated from `Signature Private Key` is required by IdP for checking the signature.

### 'Decryption Private Key' and 'Decryption Private Key Password'

`Decryption Private Key` is an OPTIONAL value and is required when `SAML Assertion Encrypted` is `true`.

`Decryption Private Key Password` is the password you've set when creating `Decryption Private Key`, required when necessary.

If `SAML Assertion Encrypted` is `true`, the corresponding certificate generated from `Decryption Private Key` is required by IdP for encrypting SAML assertion.

> ℹ️ **Note**
>
> For keys and certificates generation, `openssl` is a wonderful tool. Here is sample command line that might be helpful:
>
> ```bash
> openssl genrsa -passout pass:${privateKeyPassword} -out ${encryptPrivateKeyFilename}.pem 4096
> openssl req -new -x509 -key ${encryptPrivateKeyFilename}.pem -out ${encryptionCertificateFilename}.cer -days 3650
> ```
>
> `Signature Private Key` and `Decryption Private Key` files are enforced to be encoded in `pkcs1` scheme as pem string, which means the private key files should start with `-----BEGIN RSA PRIVATE KEY-----` and end with `-----END RSA PRIVATE KEY-----`.

### Name ID Format

`Name ID Format` is an OPTIONAL attribute that declares the name id format that would respond. The value can be among `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified`, `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`, `urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName`, `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` and `urn:oasis:names:tc:SAML:2.0:nameid-format:transient`, and the default value is `urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified`.

### Timeout

`Timeout` is the time tolerance for time validation, since the time between your SP entity and IdP entity could be different and network connection may also bring some delay. The unit is in millisecond, and the default value is 5000 (i.e. 5s).

### Profile Mapping

Logto also provide a `Profile Mapping` field that users can customize the mapping from the social vendors' profiles which are usually not standard. Each `Profile Mapping` keys is Logto's standard user profile field name and corresponding value should be social profiles field name. In current stage, Logto only concern 'id', 'name', 'avatar', 'email' and 'phone' from social profile, only 'id' is REQUIRED and others are optional fields.

### Config types

| Name                        | Type                                                                                                                                                                                                                                                                                                  | Required | Default Value                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| IdP Single Sign-On URL              | string                                                                                                                                                                                                                                                                                                | false    |                                                         |
| X.509 Certificate             | string                                                                                                                                                                                                                                                                                                | true     |                                                         |
| IdP's Metadata in XML format              | string                                                                                                                                                                                                                                                                                                | true     |                                                         |
| SP Entity ID (Audience)                    | string                                                                                                                                                                                                                                                                                                | true     |                                                         |
| Assertion Consumer Service URL | string                                                                                                                                                                                                                                                                                                | true     |                                                         |
| Message Signing Order         | `encrypt-then-sign` \| `sign-then-encrypt`                                                                                                                                                                                                                                                            | false    | `sign-then-encrypt`                                     |
| Signature Algorithm   | `http://www.w3.org/2000/09/xmldsig#rsa-sha1` \| `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256` \| `http://www.w3.org/2001/04/xmldsig-more#rsa-sha512`                                                                                                                                            | false    | `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256`     |
| Sign Authentication Request            | boolean                                                                                                                                                                                                                                                                                               | false    | false                                                   |
| SAML Assertion Encrypted            | boolean                                                                                                                                                                                                                                                                                               | false    | false                                                   |
| Signature Private Key                  | string                                                                                                                                                                                                                                                                                                | false    |                                                         |
| Signature Private Key Password              | string                                                                                                                                                                                                                                                                                                | false    |                                                         |
| Name ID Format                | `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` \| `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` \| `urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName` \| `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` \| `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` | false    | `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` |
| Timeout                     | number                                                                                                                                                                                                                                                                                                | false    | 5000                                                    |
| Profile Mapping                  | ProfileMap                                                                                                                                                                                                                                                                                            | false    |                                                         |

| ProfileMap fields | Type   | Required | Default value |
| ----------------- | ------ | -------- | ------------- |
| id                | string | false    | id            |
| name              | string | false    | name          |
| avatar            | string | false    | avatar        |
| email             | string | false    | email         |
| phone             | string | false    | phone         |

## Reference

- [Profiles for the OASIS Security Assertion Markup Language (SAML) V2.0](http://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf)
- [samlify - Highly configuarable Node.js SAML 2.0 library for Single Sign On](https://github.com/tngan/samlify)
