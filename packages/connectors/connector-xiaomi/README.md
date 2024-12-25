# Xiaomi social connector

The official Logto connector for Xiaomi social sign-in. [中文文档](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-xiaomi/README.zh-CN.md)

**Table of contents**

- [Xiaomi social connector](#xiaomi-social-connector)
  - [Get started](#get-started)
  - [Configure Xiaomi OAuth application](#configure-xiaomi-oauth-application)
  - [Scopes description](#scopes-description)
  - [Test Xiaomi connector](#test-xiaomi-connector)
  - [References](#references)

## Get started

1. Create a developer account at [Xiaomi Open Platform](https://dev.mi.com/)
2. Visit [Xiaomi Account Service](https://dev.mi.com/passport/oauth2/applist)
3. Create a new application if you don't have one

## Configure Xiaomi OAuth application

1. Visit [Xiaomi Account Service](https://dev.mi.com/passport/oauth2/applist)
2. Configure OAuth settings:
   - Open the application you want to use for login, click on "Callback URL" (if you haven't edited the callback URL, it will display as "Enabled")
   - Add authorization callback URL: `${your_logto_origin}/callback/${connector_id}`
   - `connector_id` can be found on the top of the connector details page in Logto Console
3. Get `AppID` and `AppSecret` from the application details page
4. Fill in the `clientId` and `clientSecret` fields in Logto Console with the values from step 3
5. Optional configuration:
   - `skipConfirm`: Whether to skip the Xiaomi authorization confirmation page when user is already logged in to Xiaomi account, defaults to false

## Scopes description

By default, the connector requests the following scope:

- `1`: Read user profile

Available scopes:

| Scope Value | Description | API Interface |
|-------------|-------------|---------------|
| 1 | Get user profile | user/profile |
| 3 | Get user open_id | user/openIdV2 |
| 1000 | Get Xiaomi router info | Mi Router |
| 1001 | Access all Xiaomi router info | Mi Router |
| 2001 | Access Xiaomi cloud calendar | Mi Cloud |
| 2002 | Access Xiaomi cloud alarm | Mi Cloud |
| 6000 | Use Mi Home smart home service | Mi Home |
| 6002 | Add third-party devices to Mi Home | Mi Home |
| 6003 | Alexa control Xiaomi devices | Mi Home |
| 6004 | Third-party service access to Xiaomi devices | Mi Home |
| 7000 | Follow Yellow Pages service account | Mi Cloud |
| 11000 | Get Xiaomi cloud photos | Mi Cloud |
| 12001 | Save app data to Mi Cloud | Mi Cloud |
| 12005 | Use health ECG service | Health |
| 16000 | Get Mi Wallet passes | app/get_pass |
| 20000 | Enable XiaoAI voice service | XiaoAI |
| 40000 | Enable cloud AI service | Internal Use |

Multiple scopes can be configured by separating them with spaces, e.g.: `1 3 6000`.

## Test Xiaomi connector

That's it. Don't forget to [Enable social sign-in](https://docs.logto.io/connectors/social-connectors#enable-social-sign-in) in the sign-in experience.

## References

- [Xiaomi OAuth 2.0 Documentation](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1708)
- [Xiaomi Get User Profile Documentation](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1517)
