# Set up social sign-in with Feishu

Feishu Web: An advanced enterprise collaboration and management platform, offering seamless office collaboration and aligning team goals to fully activate organizations and individuals.

## Getting started with Feishu social sign-in

The Feishu web connector is designed for desktop web applications and uses the OAuth 2.0 authentication process.

## Register a Feishu developer account

If you do not have a Feishu developer account, please register on the [Feishu Open Platform](https://open.feishu.cn/app).

## Create an application

1. On the [Developer Console](https://open.feishu.cn/app), click "Create Custom App".
2. Fill in the application name, description, select an icon, and click "Create" button.
3. In the left sidebar, click "Security Settings", fill in the "Redirect URL" as `${logto_endpoint}/callback/${connector_id}`. The corresponding value can be found in the `Callback URI` field on the Feishu connector details page in the Logto Console.
4. In "Credentials & Basic Info", you can obtain the "App ID" and "App Secret".

> ℹ️ **Note**
> For non-enterprise internal use, you also need to click "Create a version" button in "Version Management and Release" page. The "App ID" and "App Secret" will only take effect after the application status changes to "Enabled."
