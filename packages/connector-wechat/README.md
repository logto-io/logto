### WeChat web connector

The official Logto connector for WeChat social sign-in in web apps.

微信 web 应用社交登录官方 Logto 连接器 [中文文档](#)

## Get started

If you don't know the concept of the connector or haven't added this connector to your Sign-in experience yet, please see [Logto tutorial](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in).

> **⚠️ Caution**
> 
> This connector is for web apps only. If you are looking for the method for signing in with WeChat in native apps, please see [WeChat native connector](https://github.com/logto-io/logto/tree/master/packages/connector-wechat-native).

## Create a web app in the WeChat Open Platform

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Create an account

Open https://open.weixin.qq.com/, click the "Sign Up" button in the upper-right corner, then finish the sign-up process.

### Create a web app

Sign in with the account you just created. In the "Web Application" (网站应用) tab, click the big green button "Create a web app" (创建网站应用).

![App tabs](/packages/connector-wechat-native/docs/app-tabs.png)

Let's fill out the required info in the application form.

![Create a mobile app](/packages/connector-wechat-native/docs/create-mobile-app.png)

#### Basic info

Most of them are pretty straightforward. After finishing the form, click "Next step" to move on.

#### Website info

Fill "Authorization callback domain" (授权回调域) with your Logto domain. E.g., `logto.io`.

#### Waiting for the review result

After completing the website info, click "Submit Review" to continue. Usually, the review goes fast, which will end within 1-2 days.

We suspect the reviewer is allocated randomly on each submission since the standard is floating. You may get rejected the first time, but don't give up! State your status quo and ask the reviewer how to modify it.

## Compose the connector JSON

Once passed the review, go to the application details page and generate an AppSecret. Compose the connector JSON with the following format:

```json
{
  "appId": "wx123456789",
  "appSecret": "some-random-string"
}
```

### Test WeChat web connector

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in#enable-connector-in-sign-in-experience).

Once WeChat web connector is enabled, you can sign in to your app again to see if it works.
