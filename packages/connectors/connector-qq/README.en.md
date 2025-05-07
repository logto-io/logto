# QQ Social Connector

The official Logto connector for QQ social sign-in [中文文档](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-qq/README.md)

**Table of Contents**

- [QQ Social Connector](#qq-social-connector)
  - [Get Started](#get-started)
  - [Configure QQ Connect Application](#configure-qq-connect-application)
  - [Permission Requirements](#permission-requirements)
  - [Test QQ Connector](#test-qq-connector)
  - [References](#references)

QQ is a social platform by Tencent with over 600 million users. This connector helps end-users sign in to your application using their QQ accounts.

## Get Started

1. Create a developer account on [QQ Connect platform](https://connect.qq.com/)
2. Access the [Application Management](https://connect.qq.com/manage.html)
3. Create a new application (if you don't already have one)

## Configure QQ Connect Application

1. Access the [Application Management](https://connect.qq.com/manage.html)
2. Configure the OAuth settings:
   - Open the application you want to use for sign-in, and click on "Application Info"
   - Add "Website Callback Domain": `logto_endpoint`
   - Add "Website Callback URL" : `${logto_endpoint}/callback/${connector_id}`
3. Get the `APP ID` and `APP Key` from the application info page
4. Fill in the values from step 3 to the `clientId` and `clientSecret` fields in the Logto Admin Console

## Permission Requirements

To use this connector, you need to apply for the following permissions on the QQ Connect platform:

1. **UnionID Permission**: You must apply for the UnionID API permission to ensure we can obtain the user's unique identifier.
   Please apply for this permission through the [QQ Connect platform](https://connect.qq.com/).

2. **Default scope**: `get_user_info`
   This is used to obtain the user's basic information, such as nickname and avatar.
   By default, if no scope parameter is set, the system will use this permission.

## Test QQ Connector

That's it! Don't forget to enable the connector in the [Sign-in Experience](https://{logto_endpoint}/console/connectors/social).

## References

- [QQ Connect Integration Guide](https://wiki.connect.qq.com/%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C_oauth2-0)
- [QQ Open Platform API Documentation](https://wiki.connect.qq.com/)