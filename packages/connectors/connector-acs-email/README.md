# Azure Communication Services Email

Sends Logto emails through an [Azure Communication Services](https://learn.microsoft.com/azure/communication-services/concepts/email/email-overview) Email resource.

## Configuration

- **Endpoint**: the resource endpoint, e.g. `https://<your-resource>.communication.azure.com`.
- **Access Key**: a base64 access key of the resource (Keys blade in the Azure portal).
- **Sender Address**: an address on a domain verified in the resource, e.g. `DoNotReply@<your-verified-domain>`.
- **Templates**: one entry per usage type, with `Register`, `SignIn`, `ForgotPassword` and `Generic` required.

Requests are signed with HMAC-SHA256 using the access key, as the ACS REST API requires.
