# SMSBao SMS connector

The official Logto connector for SMSBao SMS service. [中文文档](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-smsbao-sms/README.zh-CN.md)

## Get started

SMSBao is an SMS service provider. This connector integrates Logto with SMSBao's domestic SMS API so end-users can receive verification codes for sign-in, registration, password reset, and other SMS verification flows.

## Set up SMS service in SMSBao

### Create a SMSBao account

Visit [SMSBao](https://www.smsbao.com/) to register an account and complete the required account setup.

### Get credentials

Prepare the following values from SMSBao:

- Username: your SMSBao account username.
- API Key or MD5 password: use a SMSBao API Key, or the MD5 value of your SMSBao login password.
- Product ID: optional. Configure it only when you use a dedicated SMSBao channel product.

This connector sends the API Key or MD5 password value as-is. It does not hash the value in Logto.

### Configure SMS templates

Create and approve SMS templates in SMSBao before using this connector. Template content configured in Logto should match the approved SMSBao content and include Logto placeholders such as `{{code}}`.

## Configure in Logto

1. In Logto Console, go to "Connectors".
2. Find and click "SMSBao SMS Service".
3. Fill in the configuration form:
   - Username: your SMSBao username.
   - API Key or MD5 password: your SMSBao API Key or already-MD5 password.
   - Product ID: optional dedicated channel product ID.
   - SMS templates: templates for Logto usage types.

## Notes

1. This connector supports SMSBao domestic SMS sending only.
2. Balance query, inbound SMS push, international SMS, and voice verification APIs are not used.
3. SMSBao returns `0` for successful sends. Other response codes are treated as sending errors.
4. It is recommended to test the connector configuration before production use.

## References

- [SMSBao API documentation](https://www.smsbao.com/openapi/213.html)
- [SMSBao Node.js example](https://www.smsbao.com/openapi/305.html)
- [Logto SMS Connector Guide](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/)
