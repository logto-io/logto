# WeCom OAuth2 connector

The custom connector for WeCom (maybe called WXwork) social sign-in.

## Get started

Sign in to [WeCom WebUI](https://work.weixin.qq.com/) with an admin account or click **Manage the enterprise(管理企业)** from the WeCom app.

In the "App Management" tab, scroll the page down and click "Create an app".

Fill in the appropriate information according to your app. Then create.

Now we have the Agent ID (NOT APPID) and Secret.

### Website info

Set the things you need on this page. It would be like:

- Allowed users: _who can see this app_
- App Homepage: _Your app homepage. E.g., `logto.io/demo-app`_

**Important**
There are three items on this page regarding the "Developer API(开发者接口)".

1. Web Authorization and JS-SDK;
2. Log in to via authorization by WeCom;
3. Enterprise Trusted IP;

Fill them according to the guide of WeCom.

### Corp ID

If you are familiar with WeChat development, you may notice that the use of Corp ID is the same as APP ID.

You can find the Corp ID at the bottom of the "My Enterprise(我的企业)" tab page. It seems like **ww\*\*\*\*** .

## Configure the connector

So we have the Agent ID, Secret, and Corp ID.

Let's complete the form for the connector.

You can leave the `Scope` field blank as it is optional. Alternatively, you can fill in `snsapi_base` or `snsapi_privateinfo`.

**Save and done**
