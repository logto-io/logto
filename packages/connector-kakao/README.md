# Kakao Connector

The Kakao connector provides a succinct way for your application to use Kakao’s OAuth 2.0 authentication system.

**Table of contents**
- [Set up a project in the Kakao Devlopers Console](#set-up-a-project-in-the-kakao-devlopers-console)
- [Configure Kakao Login](#configure-kakao-login)
  - [Activate Kakao Login](#activate-kakao-login)
  - [Privacy Setting](#privacy-setting)
  - [Security Setting (Optional)](#security-setting-optional)
- [Configure Logto](#configure-logto)
  - [Config types](#config-types)
    - [clientId](#clientid)
    - [clientSecret](#clientseceret)

## Set up a project in the Kakao Devlopers Console
- Visit the [Kakao Developers Console](https://developers.kakao.com/console/app) and sign in with your Kakao account.
- Click the **Add an application** to create new project or choose exist project.

## Configure Kakao Login

### Activate Kakao Login
- Click the **Product Settings -> Kakao Login** from the menu.
- Turn on `Kakao Login Activation`
- Add below URL into `Redirect URI`
  - `http(s)://YOUR_URL/callback/kakao-universal`
  - (Please replace `YOUR_URL` with your `Logto` URL, and choose `http` or `https` on your situation.)

### Privacy Setting
- Click the **Product Settings -> Kakao Login -> Consent Item** from the menu.
- Change state of `Nickname`, `Profile image`, and `Email` to **Required consent** (You might not able to change `Email` to **Required consent** because of your project setting.)


### Security Setting (Optional)
- Click the **Product Settings -> Kakao Login -> Security** from the menu.
- Click the `Client secret code` to generate secret code.
- Change `Activation state` to Enable. (If you enable it, `secret code` is necessary.)

## Configure Logto

### Config types

| Name         | Type    |
|--------------|---------|
| clientId     | string  |
| clientSecret | string? |

#### clientId
`clientId` is `REST API key` of your project.
(You can find it from `summary` of your project from Kakao developers console.)

#### clientSeceret
`clientSecret` is `Secret Code` of your project.
(Please check [Security Setting (Optional)](#security-setting-optional))
