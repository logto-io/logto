# Sign-in flow

## Overview

```mermaid
flowchart TD
  start([Sign-in entry])
  start --> id0[[Identifier sign-in]]
  start --> sso0[[Enterprise SSO]]
  start --> pk0[[Direct passkey]]
  start --> so0[[Social sign-in]]
  start --> ml0[[One-time token]]

  id0 -->|email SSO takeover| sso0
  id0 --> identified[User identified for sign-in]
  sso0 --> identified
  pk0 --> identified
  so0 --> identified
  ml0 --> identified

  identified --> submit_gates[["ExperienceInteraction.submit() gates (see submit-gates.md)"]]
  submit_gates --> done([OIDC redirect])
```

## Identifier sign-in

```mermaid
flowchart TD
  id0[Identifier sign-in page] --> first_screen_password{Password input shown<br/>on first screen?}

  first_screen_password -->|yes| pw0_first[First screen password form]
  first_screen_password -->|no| id1{Identifier type}

  id1 -->|username| id_submit[Submit identifier]
  id1 -->|phone| id_submit
  id1 -->|email| ide1{Check whether enterprise SSO should take over}
  ide1 -->|no| id_submit
  ide1 -->|yes| sso_redirect([Redirect to enterprise SSO])

  id_submit --> second_step[Enter second-step verification flow<br/>preferred method can switch]
  second_step --> method_priority{Preferred verification method}

  method_priority -->|passkey first| pk_try[Try identifier-based passkey]
  method_priority -->|verification code first| vc_captcha{Is captcha enabled?}
  method_priority -->|password first| pw0_second[Second screen password form]

  vc_captcha -->|yes| vc_captcha_verify[Captcha verification]
  vc_captcha -->|no| vc0[Send verification code]
  vc_captcha_verify --> vc0

  pk_try --> pk_has{Passkey already bound<br/>for this identifier}
  pk_has -->|yes| pk_verify1[Open browser passkey verification]
  pk_has -->|no| method_switch{Switch to another<br/>verification method?}

  method_switch -->|verification code| vc_captcha
  method_switch -->|password| pw0_second

  pw0_first --> pw_captcha_first{Is captcha enabled?}
  pw_captcha_first -->|yes| pw_captcha_first_verify[Captcha verification]
  pw_captcha_first -->|no| pw1_first[Enter password]
  pw_captcha_first_verify --> pw1_first
  pw1_first --> pw2_first[Verify password]

  pw0_second --> pw_captcha_second{Is captcha enabled?}
  pw_captcha_second -->|yes| pw_captcha_second_verify[Captcha verification]
  pw_captcha_second -->|no| pw1_second[Enter password]
  pw_captcha_second_verify --> pw1_second
  pw1_second --> pw2_second[Verify password]

  vc0 --> vc1[Verification code page]
  vc1 --> vc2{Code verified and user found}
  vc2 -->|no| out_vc([Register path outside this sign-in flow])

  identified(["User identified -> submit-gates.md"])
  pw2_first -->|yes| identified
  pw2_second -->|yes| identified
  vc2 -->|yes| identified
  pk_verify1 --> identified
```

## External, passkey, and one-time token entries

```mermaid
flowchart TD
  subgraph EnterpriseSSO["Enterprise SSO sign-in"]
    sso_redirect[Redirect from identifier sign-in] --> sso1[Authenticate with enterprise IdP]
    sso0[Enterprise SSO callback] --> sso1
    sso1 --> sso2[Return from enterprise IdP]
    sso2 --> sso3{Existing enterprise identity found}
    sso3 -->|yes| identified_sso[Identify user through enterprise identity]
    sso3 -->|no| sso4{Related user found by<br/>verified email}
    sso4 -->|yes| identified_sso_linked[Auto-link enterprise identity<br/>and continue sign-in]
    sso4 -->|no| sso5{Registration allowed}
    sso5 -->|yes| out_sso_register([Switch to register flow<br/>with verified enterprise identity])
    sso5 -->|no| out_sso_error([Stay on sign-in and show error])
  end

  subgraph PasskeyDirect["Direct passkey sign-in"]
    pk0[Passkey sign-in button] --> pk1[Ask browser for discoverable passkey]
    pk1 --> pk2[Verify passkey sign-in]
    pk2 --> identified_passkey[User identified via passkey]
  end

  subgraph Social["Social sign-in"]
    so0[Social sign-in callback] --> so1[Verify social callback]
    so1 --> so2{Existing social identity found}
    so2 -->|yes| identified_social[User identified via social identity]
    so2 -->|no| so3{Related user found by<br/>verified email or phone}
    so3 -->|yes| so4{Automatic account linking enabled}
    so4 -->|yes| so_linked[Bind related account<br/>and continue sign-in]
    so4 -->|no| so5[Account linking page]
    so5 -->|Bind existing account| so_linked
    so5 -->|Create new account instead| so6{Registration allowed}
    so3 -->|no| so6
    so_linked --> identified_social
    so6 -->|yes| out_social_register([Switch to register flow<br/>with verified social identity])
    so6 -->|no| out_social_error([Stay on sign-in and show error])
  end

  subgraph MagicLink["One-time token sign-in"]
    ml0[One-time token landing] --> ml1[Validate token and email hint]
    ml1 --> ml2{Known user}
    ml2 -->|yes| identified_magic_link[User identified via one-time token]
    ml2 -->|no| out_ml([Register path outside this sign-in flow])
  end

  identified(["User identified -> submit-gates.md"])
  identified_passkey --> identified
  identified_social --> identified
  identified_sso --> identified
  identified_sso_linked --> identified
  identified_magic_link --> identified
```

## Post-identification submit & MFA gates

Once identified, `ExperienceInteraction.submit()` runs the shared gate sequence in [submit-gates.md](./submit-gates.md):

- **Sign-in**: Runs all gates (`0` through `7`) in `submit()` order, including `guardFirstFactor()` and `guardMfaVerificationStatus()`.
- **Enterprise SSO**: Skips `guardMfaVerificationStatus()` (unless a requested `mfa` ACR is unmet), skips mandatory profile and passkey prompt, and skips `assertMfaFulfilled()` (unless a requested `mfa` ACR is unmet or requested enrollment factors apply).
- **Passkey sign-in**: Verified sign-in passkey skips `guardMfaVerificationStatus()` unless a requested `mfa` ACR is unmet; subsequent profile, `assertMfaFulfilled()`, trusted-device opt-in, and final ACR gates still apply.
