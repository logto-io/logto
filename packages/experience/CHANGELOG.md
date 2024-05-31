# Change Log

## 1.6.2

### Patch Changes

- cb1a38c40: show global loading icon on page relocate

  This is to address the issue where the user is redirected back to the client after a successful login, but the page is not yet fully loaded. This will show a global loading icon to indicate that the page is still loading. Preventing the user from interacting with the current sign-in page and avoid page idling confusion.

## 1.6.1

### Patch Changes

- b80934ac5: fix native social sign-in callback

  In a native environment, the social sign-in callback that posts to the native container (e.g. WKWebView in iOS) was wrong.

  This was introduced by a refactor in #5536: It updated the callback path from `/sign-in/social/:connectorId` to `/callback/social/:connectorId`. However, the function to post the message to the native container was not updated accordingly.

- bbd399e15: fix the new user from SSO register hook event not triggering bug

  ### Issue

  When a new user registers via SSO, the `PostRegister` interaction hook event is not triggered. `PostSignIn` event is mistakenly triggered instead.

  ### Root Cause

  In the SSO `post /api/interaction/sso/:connectionId/registration` API, we update the interaction event to `Register`.
  However, the hook middleware reads the event from interaction session ahead of the API logic, and the event is not updated resulting in the wrong event being triggered.

  In the current interaction API design, we should mutate the interaction event by calling the `PUT /api/interaction/event` API, instead of updating the event directly in the submit interaction APIs. (Just like the no direct mutation rule for a react state). So we can ensure the correct side effect like logs and hooks are triggered properly.

  All the other sign-in methods are using the `PUT /api/interaction/event` API to update the event. But when implementing the SSO registration API, we were trying to reduce the API requests and directly updated the event in the registration API which will submit the interaction directly.

  ### Solution

  Remove the event update logic in the SSO registration API and call the `PUT /api/interaction/event` API to update the event.
  This will ensure the correct event is triggered in the hook middleware.

  ### Action Items

  Align the current interaction API design for now.
  Need to improve the session/interaction API logic to simplify the whole process.

## 1.6.0

### Minor Changes

- 7756f50f8: support direct sign-in for sso
- 2cbc591ff: support direct sign-in

  Instead of showing a screen for the user to choose between the sign-in methods, a specific sign-in method can be initiated directly by setting the `direct_sign_in` parameter in the OIDC authentication request.

  This parameter follows the format of `direct_sign_in=<method>:<target>`, where:

  - `<method>` is the sign-in method to trigger. Currently the only supported value is `social`.
  - `<target>` is the target value for the sign-in method. If the method is `social`, the value is the social connector's `target`.

  When a valid `direct_sign_in` parameter is set, the first screen will be skipped and the specified sign-in method will be triggered immediately upon entering the sign-in experience. If the parameter is invalid, the default behavior of showing the first screen will be used.

### Patch Changes

- 5a7204571: skip non-object messages in the native environment

  In the `WKWebView` of new iOS versions, some script will constantly post messages to the
  window object with increasing numbers as the message content ("1", "2", "3", ...).

  Ideally, we should check the source of the message with Logto-specific identifier in the
  `event.data`; however, this change will result a breaking change for the existing
  native SDK implementations. Add the `isObject` check to prevent the crazy messages while
  keeping the backward compatibility.

## 1.5.0

### Minor Changes

- 32df9acde: update user consent page to support the new third-party application feature

  - Only show the user consent page if current application is a third-party application, otherwise auto-consent the requested scopes.
  - Add the new fetching API to get the user consent context. Including the application detail, authenticated user info, all the requested scopes and user organizations info (if requested scopes include the organization scope).
  - Add the new user consent interaction API and authorize button. User have to manually authorize the requested scopes for the third-party application before continue the authentication flow.

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3

## 1.4.0

### Minor Changes

- 9a7b19e49: Implement the new single sign-on (SSO) interaction flow

  - `/single-sign-on/email` - The SSO email form page for user to enter their email address.
  - `/single-sign-on/connectors` - The SSO connectors page for user to select the enabled SSO connector they want to use.
  - Implement the email identifier guard on all the sign-in and registration identifier forms. If the email address is enabled with SSO, redirect user to the SSO flow.

### Patch Changes

- 9421375d7: Bump libphonenumber-js to v1.10.51 to support China 19 started phone numbers. Thanks to @agileago

## 1.3.0

### Minor Changes

- 6727f629d: feature: introduce multi-factor authentication

  We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

  In this release, we introduce the following MFA methods:

  - Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
  - WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
  - Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

  For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.

## 1.2.1

### Patch Changes

- 6f5a0acad: fix a bug that prevents user from customizing i18n translations in Sign-in Experience config

## 1.2.0

### Minor Changes

- e8b0b1d02: feature: password policy

  ### Summary

  This feature enables custom password policy for users. Now it is possible to guard with the following rules when a user is creating a new password:

  - Minimum length (default: `8`)
  - Minimum character types (default: `1`)
  - If the password has been pwned (default: `true`)
  - If the password is exactly the same as or made up of the restricted phrases:
    - Repetitive or sequential characters (default: `true`)
    - User information (default: `true`)
    - Custom words (default: `[]`)

  If you are an existing Logto Cloud user or upgrading from a previous version, to ensure a smooth experience, we'll keep the original policy as much as possible:

  > The original password policy requires a minimum length of 8 and at least 2 character types (letters, numbers, and symbols).

  Note in the new policy implementation, it is not possible to combine lower and upper case letters into one character type. So the original password policy will be translated into the following:

  - Minimum length: `8`
  - Minimum character types: `2`
  - Pwned: `false`
  - Repetitive or sequential characters: `false`
  - User information: `false`
  - Custom words: `[]`

  If you want to change the policy, you can do it:

  - Logto Console -> Sign-in experience -> Password policy.
  - Update `passwordPolicy` property in the sign-in experience via Management API.

  ### Side effects

  - All new users will be affected by the new policy immediately.
  - Existing users will not be affected by the new policy until they change their password.
  - We removed password restrictions when adding or updating a user via Management API.

### Patch Changes

- f8408fa77: rename the package `phrases-ui` to `phrases-experience`
- f6723d5e2: rename the package `ui` to `experience`

## 1.1.5

### Patch Changes

- c743cef42: Bug fix main flow preview mode should not allow user interaction.

  - Recover the missing preview classname from the preview mode body element

## 1.1.4

### Patch Changes

- 046a5771b: upgrade i18next series packages (#3733, #3743)

## 1.1.3

### Patch Changes

- 748878ce5: add React context and hook to app-insights, fix init issue for frontend projects

## 1.1.2

### Patch Changes

- 352807b16: support setting cloud role name for AppInsights in React

## 1.1.1

### Patch Changes

- 4945b0be2: Apply security headers

  Apply security headers to logto http request response using (helmetjs)[https://helmetjs.github.io/].

  - [x] crossOriginOpenerPolicy
  - [x] crossOriginEmbedderPolicy
  - [x] crossOriginResourcePolicy
  - [x] hidePoweredBy
  - [x] hsts
  - [x] ieNoOpen
  - [x] noSniff
  - [x] referrerPolicy
  - [x] xssFilter
  - [x] Content-Security-Policy

## 1.1.0

## 1.0.3

## 1.0.2

## 1.0.1

## 1.0.0

### Major Changes

- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

- 343b1090f: **💥 BREAKING CHANGE 💥** Move `/api/phrase` API to `/api/.well-known/phrases`

### Minor Changes

- 343b1090f: ### Simplify the terms of use and privacy policy manual agreement steps for the sign-in flow

  The Terms of Use and Privacy Policy manuel agreement are now removed from the sign-in flow.

  - The changes may take effect on all the existing sign-in flows, including password sign-in, social sign-in, and verification-code sign-in.
  - The agreement checkbox in sign-in pages is now replaced with links to the Terms of Use and Privacy Policy pages. Users can still read the agreements before signing in.
  - The manual agreement steps are still mandatory for the sign-up flow. Users must agree to the Terms of Use and Privacy Policy before signing up a new account. Including sign-up with new social identities. The agreement checkbox in sign-up pages remain still.

- f41fd3f05: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- 343b1090f: ### Update the password policy

  Password policy description: Password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.

  - min-length updates: Password requires a minimum of 8 characters
  - allowed characters updates: Password contains a mix of letters, numbers, and symbols
    - digits: 0-9
    - letters: a-z, A-Z
    - symbols: !"#$%&'()\*+,./:;<=>?@[\]^\_`{|}~-
  - At least two types of characters are required:
    - letters and digits
    - letters and symbols
    - digits and symbols

  > notice: The new password policy is applied to new users or new passwords only. Existing users are not affected by this change, users may still use their old password to sign-in.

- 343b1090f: ### Add dynamic favicon and html title

  - Add the favicon field in the sign-in-experience branding settings. Users would be able to upload their own favicon. Use local logto icon as a fallback

  - Set different html title for different pages.
    - sign-in
    - register
    - forgot-password
    - logto

- 343b1090f: Allow admin tenant admin to create tenants without limitation
- 343b1090f: ## Add iframe modal for mobile platform

  Implement a full screen iframe modal on the mobile platform. As for most of the webview containers, opening a new tab is not allowed. So we need to implement a full screen iframe modal to show the external link page on the mobile platform.

- 343b1090f: New feature: User account settings page

  - We have removed the previous settings page and moved it to the account settings page. You can access to the new settings menu by clicking the user avatar in the top right corner.
  - You can directly change the language or theme from the popover menu, and explore more account settings by clicking the "Profile" menu item.
  - You can update your avatar, name and username in the profile page, and also changing your password.
  - [Cloud] Cloud users can also link their email address and social accounts (Google and GitHub at first launch).

- c12717412: ## Smart Identifier Input designed to streamline your sign-in experience

  - Smart Contact Input
  - Smart Identifier Input
  - Intelligent Identifier Input Field

  Content:
  We have integrated the traditional input fields for username, phone number, and email into a single intelligent input box. This advanced input box automatically identifies the type of characters you’re entering, such as an @ sign or consecutive numbers, and provides relevant error feedback. By streamlining the sign-in process, users no longer need to waste time figuring out which button to click to switch their desired login method. This reduces the risk of errors and ensures a smoother sign-in experience.

- 343b1090f: Implement a country code selector dropdown component with search box. Users may able to quick search for a country code by typing in the search box.
- 343b1090f: remove the branding style config and make the logo URL config optional
- c12717412: **Customize CSS for Sign-in Experience**

  We have put a lot of effort into improving the user sign-in experience and have provided a brand color option for the UI. However, we know that fine-tuning UI requirements can be unpredictable. While Logto is still exploring the best options for customization, we want to provide a programmatic method to unblock your development.

  You can now use the Management API `PATCH /api/sign-in-exp` with body `{ "customCss": "arbitrary string" }` to set customized CSS for the sign-in experience. You should see the value of `customCss` attached after `<title>` of the page. If the style has a higher priority, it should be able to override.

  > **Note**
  >
  > Since Logto uses CSS Modules, you may see a hash value in the `class` property of DOM elements (e.g. a `<div>` with `vUugRG_container`). To override these, you can use the `$=` CSS selector to match elements that end with a specified value. In this case, it should be `div[class$=container]`.

- 343b1090f: Add custom CSS code editor so that users can apply advanced UI customization.
  - Users can check the real time preview of the CSS via SIE preview on the right side.
- 2168936b9: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

- 343b1090f: ### Add custom content sign-in-experience settings to allow insert custom static html content to the logto sign-in pages

  - feat: combine with the custom css, give the user the ability to further customize the sign-in pages

- fdb2bb48e: **Streamlining the social sign-up flow**

  - detect trusted email (or phone number) from the social account
    - email (or phone number) has been registered: automatically connecting the social identity to the existing user account with a single click
    - email (or phone number) not registered: automatically sync up the user profile with the social provided email (or phone) if and only if marked as a required user profile.

- f41fd3f05: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

### Patch Changes

- 51f527b0c: bug fixes

  - core: fix 500 error when enabling app admin access in console
  - ui: handle required profile errors on social binding flow

- 343b1090f: ## Implement a lite version of set password form.

  To simplify the effort when user set new password, we implement a lite version of set password form.

  The lite version of set password form only contains only one field password. It will be used if and only if the forgot-password feature is enabled (password can be reset either by email and phone).

  If you do not have any email or sms service enabled, we still use the old version of set password form which contains two fields: password and confirm password.

- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 02cc9abd8: Fix a bug to show forgot password when only SMS connector is configured
- 343b1090f: - Add Power By Logto Signature to the main-flow pages

## 1.0.0-rc.3

## 1.0.0-rc.2

### Minor Changes

- c12717412: ## Smart Identifier Input designed to streamline your sign-in experience

  - Smart Contact Input
  - Smart Identifier Input
  - Intelligent Identifier Input Field

  Content:
  We have integrated the traditional input fields for username, phone number, and email into a single intelligent input box. This advanced input box automatically identifies the type of characters you’re entering, such as an @ sign or consecutive numbers, and provides relevant error feedback. By streamlining the sign-in process, users no longer need to waste time figuring out which button to click to switch their desired login method. This reduces the risk of errors and ensures a smoother sign-in experience.

- c12717412: **Customize CSS for Sign-in Experience**

  We have put a lot of effort into improving the user sign-in experience and have provided a brand color option for the UI. However, we know that fine-tuning UI requirements can be unpredictable. While Logto is still exploring the best options for customization, we want to provide a programmatic method to unblock your development.

  You can now use the Management API `PATCH /api/sign-in-exp` with body `{ "customCss": "arbitrary string" }` to set customized CSS for the sign-in experience. You should see the value of `customCss` attached after `<title>` of the page. If the style has a higher priority, it should be able to override.

  > **Note**
  >
  > Since Logto uses CSS Modules, you may see a hash value in the `class` property of DOM elements (e.g. a `<div>` with `vUugRG_container`). To override these, you can use the `$=` CSS selector to match elements that end with a specified value. In this case, it should be `div[class$=container]`.

## 1.0.0-rc.1

### Patch Changes

- 51f527b0: bug fixes

  - core: fix 500 error when enabling app admin access in console
  - ui: handle required profile errors on social binding flow

## 1.0.0-rc.0

### Minor Changes

- f41fd3f0: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- fdb2bb48: **Streamlining the social sign-up flow**

  - detect trusted email (or phone number) from the social account
    - email (or phone number) has been registered: automatically connecting the social identity to the existing user account with a single click
    - email (or phone number) not registered: automatically sync up the user profile with the social provided email (or phone) if and only if marked as a required user profile.

- f41fd3f0: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

## 1.0.0-beta.19

## 1.0.0-beta.18

### Major Changes

- 1c916011: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

## 1.0.0-beta.17

### Patch Changes

- 02cc9abd: Fix a bug to show forgot password when only SMS connector is configured

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.

## 1.0.0-beta.15

## 1.0.0-beta.14

## 1.0.0-beta.13

### Minor Changes

- 2168936b: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/ui

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### Features

- **ui:** add a11y support ([#2076](https://github.com/logto-io/logto/issues/2076)) ([2249d71](https://github.com/logto-io/logto/commit/2249d717a8928597d00c383c268d6fdc506ac437))
- **ui:** add reset password error handling flow ([#2079](https://github.com/logto-io/logto/issues/2079)) ([afa2ac4](https://github.com/logto-io/logto/commit/afa2ac47ee461e3526f61594e456d484fd3166af))
- **ui:** global confirm modal ([#2018](https://github.com/logto-io/logto/issues/2018)) ([f1ca49c](https://github.com/logto-io/logto/commit/f1ca49c89253daef8b47ec88e30f69df818374d1))

### Bug Fixes

- **console:** remove connector id and prevent text overflow ([#2072](https://github.com/logto-io/logto/issues/2072)) ([05b5025](https://github.com/logto-io/logto/commit/05b50250a387635649614aaeeec9757e7034a19d))
- **ui:** fix ut ([9ea6a8c](https://github.com/logto-io/logto/commit/9ea6a8c8e94e116d8efbbff63b39738162cbaec1))
- **ui:** revert color token changes in ui as it uses different design system ([489e2b3](https://github.com/logto-io/logto/commit/489e2b3a1129fbbf824955e4697c1d64ff294d95))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### Features

- **ui:** add forget password flow ([#1952](https://github.com/logto-io/logto/issues/1952)) ([ba787b4](https://github.com/logto-io/logto/commit/ba787b434ba4dd43064c56115eabfdba9912f98a))
- **ui:** add forget password page ([#1943](https://github.com/logto-io/logto/issues/1943)) ([39d80d9](https://github.com/logto-io/logto/commit/39d80d991235c93346c26977541d3c7040379a13))
- **ui:** add passwordless switch ([#1976](https://github.com/logto-io/logto/issues/1976)) ([ddb0e47](https://github.com/logto-io/logto/commit/ddb0e47950b3bd7f92af2a8a5e14b201e0a10ed7))
- **ui:** add reset password form ([#1964](https://github.com/logto-io/logto/issues/1964)) ([f97ec56](https://github.com/logto-io/logto/commit/f97ec56fbf169538cff5f8f23ed8bb67e9483b27))
- **ui:** add reset password page ([#1961](https://github.com/logto-io/logto/issues/1961)) ([ff81b0f](https://github.com/logto-io/logto/commit/ff81b0f83e86dd3686341d3612f3f5e8f075cba6))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))
- **ui:** align mobile input outline ([#1991](https://github.com/logto-io/logto/issues/1991)) ([c9ba198](https://github.com/logto-io/logto/commit/c9ba198b59ae52d3c5b4520a98864519d7a756f7))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### Features

- add Portuguese translation ([f268ecb](https://github.com/logto-io/logto/commit/f268ecb1a8d57d1e33225bec8852f3bc377dd478))

### Bug Fixes

- **console,ui:** fix locale guard issue in settings page ([e200578](https://github.com/logto-io/logto/commit/e2005780a39fa7b5f5c5e406f37805913b684c18))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/ui

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/ui

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

**Note:** Version bump only for package @logto/ui

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### Bug Fixes

- build and types ([8b51543](https://github.com/logto-io/logto/commit/8b515435cdb0644d0ca19e2c26ba3e744355bb0b))
- **ui,console,demo-app:** update react render method ([#1750](https://github.com/logto-io/logto/issues/1750)) ([4b972f2](https://github.com/logto-io/logto/commit/4b972f2e23e2d4609d9955c4d1d42972f368f5b9))
- **ui:** add sandbox props to iframe ([#1757](https://github.com/logto-io/logto/issues/1757)) ([62d2afe](https://github.com/logto-io/logto/commit/62d2afe9579334547b7ff5b803299b89933a5bd8))
- **ui:** connector name should fallback to en ([#1718](https://github.com/logto-io/logto/issues/1718)) ([3af5b1b](https://github.com/logto-io/logto/commit/3af5b1b4250d6de6883b4c8a8b9f7cf4f9b12dab))
- **ui:** extract ReactModal elementApp and fix act warning in ut ([#1756](https://github.com/logto-io/logto/issues/1756)) ([0270bf1](https://github.com/logto-io/logto/commit/0270bf1be3a51d9b9f8ed84a0327c58ed8a1bd4d))
- **ui:** fix ui test ([e4629f2](https://github.com/logto-io/logto/commit/e4629f2a5fd26a1d8eaefd04042eaeb5563ec30c))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Bug Fixes

- **ui:** fix some firefox standout bug ([#1615](https://github.com/logto-io/logto/issues/1615)) ([4ce6bd8](https://github.com/logto-io/logto/commit/4ce6bd8cf5c5953d9f62878ab2ea6ede74f6ca48))
- **ui:** protect window.location xss ([#1639](https://github.com/logto-io/logto/issues/1639)) ([34b465c](https://github.com/logto-io/logto/commit/34b465c7d83999e2215ef83555b64e38778b8b49))
- **ui:** should clear prev passcode input when click on backspace ([#1660](https://github.com/logto-io/logto/issues/1660)) ([7dfbc30](https://github.com/logto-io/logto/commit/7dfbc300b09cc3dac2a06176bf2cbc9f338d857e))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

### Features

- **ui:** add submit input to all the sign-in & register forms ([#1587](https://github.com/logto-io/logto/issues/1587)) ([0c0c83c](https://github.com/logto-io/logto/commit/0c0c83cc8f78f611f5a8527ecedd6ce21d1dad80))

### Bug Fixes

- **ui:** fix no-restrict-syntax in ui ([#1559](https://github.com/logto-io/logto/issues/1559)) ([816ce9f](https://github.com/logto-io/logto/commit/816ce9f903fc939b676165c5ad7e17c72f4c1c86))
- **ui:** format phone number with country calling code ([#1551](https://github.com/logto-io/logto/issues/1551)) ([c6384be](https://github.com/logto-io/logto/commit/c6384bed84340909aaa41f10abaea26b5195e6a5))

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

### Bug Fixes

- **ui,core:** fix i18n issue ([#1548](https://github.com/logto-io/logto/issues/1548)) ([6b58d8a](https://github.com/logto-io/logto/commit/6b58d8a1610b1b75155d873e8898786d2b723ec6))
- **ui:** fix multiple libphonmenumber packed bug ([#1544](https://github.com/logto-io/logto/issues/1544)) ([e06f8d0](https://github.com/logto-io/logto/commit/e06f8d027eaea3ab89b4fd301be46af3508b61b5))

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Bug Fixes

- **ui:** add form submit event ([#1489](https://github.com/logto-io/logto/issues/1489)) ([f52fa58](https://github.com/logto-io/logto/commit/f52fa5891d70bf9a50c76eb3efa35f6031dc88cb))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

### Bug Fixes

- **core,ui:** remove todo comments ([#1454](https://github.com/logto-io/logto/issues/1454)) ([d5d6c5e](https://github.com/logto-io/logto/commit/d5d6c5ed083364dabaa0220deaa6a22e0350d146))

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

### Bug Fixes

- **ui:** dark mode seed ([#1426](https://github.com/logto-io/logto/issues/1426)) ([be73dbf](https://github.com/logto-io/logto/commit/be73dbf4ef14cf49779775dd95848ba73904a4b2))
- **ui:** set ui specific i18n storage key ([#1441](https://github.com/logto-io/logto/issues/1441)) ([5b121d7](https://github.com/logto-io/logto/commit/5b121d78551d471125737daf31d4e0505e69e409))

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

**Note:** Version bump only for package @logto/ui

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

**Note:** Version bump only for package @logto/ui

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/ui

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/ui

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

**Note:** Version bump only for package @logto/ui

### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/ui

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/ui

### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/ui

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **connector:** apple ([#966](https://github.com/logto-io/logto/issues/966)) ([7400ed8](https://github.com/logto-io/logto/commit/7400ed8896fdceda6165a0540413efb4e3a47438))
- **console,ui:** generate dark mode color in console ([#1231](https://github.com/logto-io/logto/issues/1231)) ([f72b21d](https://github.com/logto-io/logto/commit/f72b21d1602ab0fb35ef3e7d84f6c8ebd7e18b08))
- **console:** add 404 page in admin console ([0d047fb](https://github.com/logto-io/logto/commit/0d047fbaf115f005615b5df06170e526283d9335))
- **console:** add mobile web tab in preview ([#1214](https://github.com/logto-io/logto/issues/1214)) ([9b6fd4c](https://github.com/logto-io/logto/commit/9b6fd4c417f2ee53375e436c839b711c86403d58))
- **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
- **core,connectors:** update Aliyun logo and add logo_dark to Apple, Github ([#1194](https://github.com/logto-io/logto/issues/1194)) ([98f8083](https://github.com/logto-io/logto/commit/98f808320b1c79c51f8bd6f49e35ca44363ea560))
- **core,console:** social connector targets ([#851](https://github.com/logto-io/logto/issues/851)) ([127664a](https://github.com/logto-io/logto/commit/127664a62f1b1c794569b7fe9d0bfceb7b97dc74))
- **core:** add sign-in-mode ([#1132](https://github.com/logto-io/logto/issues/1132)) ([f640dad](https://github.com/logto-io/logto/commit/f640dad52f2e75620b392114673860138e1aca2c))
- **core:** add socialConnectors details for get sign-in-settings ([#804](https://github.com/logto-io/logto/issues/804)) ([7a922cb](https://github.com/logto-io/logto/commit/7a922cbd331b45443f7f19a8af3dcd9156453079))
- **core:** update connector db schema ([#732](https://github.com/logto-io/logto/issues/732)) ([8e1533a](https://github.com/logto-io/logto/commit/8e1533a70267d459feea4e5174296b17bef84d48))
- **demo-app:** show notification in main flow ([#1038](https://github.com/logto-io/logto/issues/1038)) ([90ca76e](https://github.com/logto-io/logto/commit/90ca76eeb5460b66d2241f137f179bf4d5d6ae37))
- **ui:** add bind social account flow ([#671](https://github.com/logto-io/logto/issues/671)) ([5e251bd](https://github.com/logto-io/logto/commit/5e251bdc0818195d7eb104488bdb8a3194205bdd))
- **ui:** add darkmode logo ([#880](https://github.com/logto-io/logto/issues/880)) ([9fa13a2](https://github.com/logto-io/logto/commit/9fa13a24ae2e1b3024b3ef2169736d27847f04eb))
- **ui:** add global primary color settings ([#871](https://github.com/logto-io/logto/issues/871)) ([0f2827c](https://github.com/logto-io/logto/commit/0f2827ccb873bf30e44209da39803ac6cc839af2))
- **ui:** add mobile terms of use iframe modal ([#947](https://github.com/logto-io/logto/issues/947)) ([4abcda6](https://github.com/logto-io/logto/commit/4abcda6820f0d824d110ee3ddd6d457433dfbf26))
- **ui:** add native sdk guard logic ([#1096](https://github.com/logto-io/logto/issues/1096)) ([147775a](https://github.com/logto-io/logto/commit/147775a8f45dbb5bbf05b3bf1b7c11c0a8acf4a4))
- **ui:** add Notification component ([#994](https://github.com/logto-io/logto/issues/994)) ([8530e24](https://github.com/logto-io/logto/commit/8530e249aa6d63efe594a08f800be4bfb43ed77e))
- **ui:** add social dropdown list for desktop ([#834](https://github.com/logto-io/logto/issues/834)) ([36922b3](https://github.com/logto-io/logto/commit/36922b343f06daa1c7d4125bd0066ec06962123d))
- **ui:** app notification ([#999](https://github.com/logto-io/logto/issues/999)) ([f4e380f](https://github.com/logto-io/logto/commit/f4e380f0b1b815314b24cec1c9013d9f3bb806a7))
- **ui:** display error message on social callback page ([#1097](https://github.com/logto-io/logto/issues/1097)) ([f3b8678](https://github.com/logto-io/logto/commit/f3b8678a8c5e938276208c222242c3fedf4d397a))
- **ui:** implement preview mode ([#852](https://github.com/logto-io/logto/issues/852)) ([ef19fb3](https://github.com/logto-io/logto/commit/ef19fb3d27a84509613b1f1d47819c06e9a6e9d1))
- **ui:** init destop styling foundation ([#787](https://github.com/logto-io/logto/issues/787)) ([5c02ec3](https://github.com/logto-io/logto/commit/5c02ec3bdae162bd83d26c56f7ae34ee6e505ca2))
- **ui:** not found page ([#691](https://github.com/logto-io/logto/issues/691)) ([731ff1c](https://github.com/logto-io/logto/commit/731ff1cbdca76104845dcf3d1223953ce8e5af93))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **console:** socialConnectors in preview data ([#862](https://github.com/logto-io/logto/issues/862)) ([a2cd983](https://github.com/logto-io/logto/commit/a2cd983d97097f86a07f988031b76665958ac24b))
- revert "chore(deps): update parcel monorepo to v2.6.0" ([877bbc0](https://github.com/logto-io/logto/commit/877bbc0d2c5c0559a3fc9a8e801a13ebff2292a6))
- **ui:** add body background color ([#831](https://github.com/logto-io/logto/issues/831)) ([be8b862](https://github.com/logto-io/logto/commit/be8b8628ba345bd8f8832b2123a43e70c236406d))
- **ui:** add default success true for no response api ([#842](https://github.com/logto-io/logto/issues/842)) ([88600c0](https://github.com/logto-io/logto/commit/88600c012c892c969f1e5df7ec5f46874513a058))
- **ui:** add i18n formater for zh-CN list ([#1009](https://github.com/logto-io/logto/issues/1009)) ([ca5c8aa](https://github.com/logto-io/logto/commit/ca5c8aaec1db7ffc330f50fcdc14400e06ad6f54))
- **ui:** catch request exceptions with no response body ([#790](https://github.com/logto-io/logto/issues/790)) ([48de9c0](https://github.com/logto-io/logto/commit/48de9c072bb060f3e5aeb785d7a765a66a0912fe))
- **ui:** fix callback link params for apple ([#985](https://github.com/logto-io/logto/issues/985)) ([362c3a6](https://github.com/logto-io/logto/commit/362c3a6e6ed3cab24a85f9e268509d31430609e4))
- **ui:** fix ci fail ([#708](https://github.com/logto-io/logto/issues/708)) ([da49812](https://github.com/logto-io/logto/commit/da4981216452ee11cf91c8f52a1d50ef18f9a37f))
- **UI:** fix connector target and id used in UI ([#838](https://github.com/logto-io/logto/issues/838)) ([cd46505](https://github.com/logto-io/logto/commit/cd4650508f9b1b4d2051e600afdf1e157dcf0631))
- **ui:** fix count down bug ([#874](https://github.com/logto-io/logto/issues/874)) ([9c1e9ef](https://github.com/logto-io/logto/commit/9c1e9ef7edb39d5d15dcbb21a8789fab78326de5))
- **ui:** fix create account page reload issue ([#832](https://github.com/logto-io/logto/issues/832)) ([e221758](https://github.com/logto-io/logto/commit/e2217584a40098d6bfcd6a745e8e0d982e8936c0))
- **ui:** fix drawer overflow bug ([#984](https://github.com/logto-io/logto/issues/984)) ([b9131e9](https://github.com/logto-io/logto/commit/b9131e97659dece341ba4dd0cb47686a24698dcb))
- **ui:** fix social bug ([#939](https://github.com/logto-io/logto/issues/939)) ([7a17d41](https://github.com/logto-io/logto/commit/7a17d41acf7cc068d0ec5568bcd842db51aa8b39))
- **ui:** fix social native interaction bug ([#772](https://github.com/logto-io/logto/issues/772)) ([2161856](https://github.com/logto-io/logto/commit/2161856bcd33b66c8390b343cc3591ff284be286))
- **ui:** fix some of the bug bash issues ([#1053](https://github.com/logto-io/logto/issues/1053)) ([db1b6d2](https://github.com/logto-io/logto/commit/db1b6d247a3d07f81ff1284b1fdbd3e7ffcc97aa))
- **ui:** fix typo ([#792](https://github.com/logto-io/logto/issues/792)) ([13cd2c1](https://github.com/logto-io/logto/commit/13cd2c100ed32b40da72364d1f4685edd7d6d25a))
- **ui:** fix ui i18n package error ([#713](https://github.com/logto-io/logto/issues/713)) ([34d798b](https://github.com/logto-io/logto/commit/34d798b645f16aff05b3818797b7914b5d2bc9b3))
- **ui:** fix undefined dark-primary-color bug ([#876](https://github.com/logto-io/logto/issues/876)) ([542d878](https://github.com/logto-io/logto/commit/542d878231b98710af6e5a8ba6a5a5f74eee73a3))
- **ui:** hide social signin method if connectors are empty ([#909](https://github.com/logto-io/logto/issues/909)) ([5e0c39e](https://github.com/logto-io/logto/commit/5e0c39e5166072c2c8d729c2e0f714507fd93ba6))
- **ui:** input fields ([#1125](https://github.com/logto-io/logto/issues/1125)) ([20f7ad9](https://github.com/logto-io/logto/commit/20f7ad986353eb0026cbec417eaed3c334279f86))
- **ui:** relocate svg jest config ([#856](https://github.com/logto-io/logto/issues/856)) ([d8c62c1](https://github.com/logto-io/logto/commit/d8c62c14a677d9afa8ce4b2c78cdd8fc8b1ee6c1))
- **ui:** social bind account should back to sign-in page ([#952](https://github.com/logto-io/logto/issues/952)) ([da41369](https://github.com/logto-io/logto/commit/da41369bfd0e444190d33edef6527b32b538dbee))
- **ui:** ui design review fix ([#697](https://github.com/logto-io/logto/issues/697)) ([15dd1a7](https://github.com/logto-io/logto/commit/15dd1a767e9eddfd37a80b47775afbe327b76d5b))
- **ui:** ui refinement ([#855](https://github.com/logto-io/logto/issues/855)) ([1661c81](https://github.com/logto-io/logto/commit/1661c8121a9ed1620a4d8fefd51523d2be261089))
- **ut:** fix ut ([#683](https://github.com/logto-io/logto/issues/683)) ([b0138bd](https://github.com/logto-io/logto/commit/b0138bdc0f2c43f40e20e83b621f3de3d068c171))
