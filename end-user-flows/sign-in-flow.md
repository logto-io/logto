# Sign-in flow

```mermaid
flowchart TD
  start([Sign-in entry])

  subgraph EntryPoints["Sign-in entry points"]
    id0[Identifier sign-in page]
    pk0[Passkey sign-in button]
    so0[Social sign-in callback]
    sso0[Enterprise SSO callback]
    ml0[One-time token landing]
  end

  start --> id0
  start --> pk0
  start --> so0
  start --> sso0
  start --> ml0

  subgraph Identifier["Identifier sign-in"]
    id0 --> id1{Identifier type}

    id1 -->|username| idu1[Save username]
    idu1 --> pw0

    id1 -->|email| ide1[Check whether enterprise SSO should take over]
    ide1 -->|yes| sso_redirect[Redirect to enterprise SSO]
    ide1 -->|no| idm1

    id1 -->|phone| idm1{Passkey sign-in enabled}

    idm1 -->|yes| pk_try[Try identifier-based passkey]
    idm1 -->|no| idm2{Preferred local method}

    pk_try --> pk_has{Passkey already bound<br/>for this identifier}
    pk_has -->|yes| pk_verify1[Open browser passkey verification]
    pk_has -->|no| idm2

    idm2 -->|password| pw0[Password page]
    idm2 -->|verification code| vc0[Send verification code]

    vc0 --> vc1[Verification code page]
    vc1 --> vc2{Code verified and user found}
    vc2 -->|yes| identified
    vc2 -->|no| out_vc[Register path outside this sign-in flow]

    pw0 --> pw1[Enter password<br/>optional captcha]
    pw1 --> pw2{Password accepted}
    pw2 -->|yes| identified
    pw2 -->|no| pw0

    pk_verify1 --> identified
  end

  subgraph PasskeyDirect["Direct passkey sign-in"]
    pk0 --> pk1[Ask browser for discoverable passkey]
    pk1 --> pk2[Verify passkey sign-in]
    pk2 --> identified
  end

  subgraph Social["Social sign-in"]
    so0 --> so1[Verify social callback]
    so1 --> so2{Existing social identity found}
    so2 -->|yes| identified
    so2 -->|no| so3{Related user found by<br/>verified email or phone}
    so3 -->|yes| so4{Automatic account linking enabled}
    so4 -->|yes| so_linked[Bind related account<br/>and continue sign-in]
    so4 -->|no| so5[Account linking page]
    so5 -->|Bind existing account| so_linked
    so5 -->|Create new account instead| so6{Registration allowed}
    so3 -->|no| so6
    so_linked --> identified
    so6 -->|yes| out_social_register[Switch to register flow<br/>with verified social identity]
    so6 -->|no| out_social_error[Stay on sign-in and show error]
  end

  subgraph EnterpriseSSO["Enterprise SSO sign-in"]
    sso_redirect --> sso1[Authenticate with enterprise IdP]
    sso0 --> sso1
    sso1 --> sso2[Return from enterprise IdP]
    sso2 --> sso3{Existing enterprise identity found}
    sso3 -->|yes| identified_sso[Identify user through enterprise identity]
    sso3 -->|no| sso4{Related user found by<br/>verified email}
    sso4 -->|yes| identified_sso_linked[Auto-link enterprise identity<br/>and continue sign-in]
    sso4 -->|no| sso5{Registration allowed}
    sso5 -->|yes| out_sso_register[Switch to register flow<br/>with verified enterprise identity]
    sso5 -->|no| out_sso_error[Stay on sign-in and show error]
  end

  identified_sso --> identified
  identified_sso_linked --> identified

  subgraph MagicLink["One-time token sign-in"]
    ml0 --> ml1[Validate token and email hint]
    ml1 --> ml2{Known user}
    ml2 -->|yes| identified
    ml2 -->|no| out_ml[Register path outside this sign-in flow]
  end

  note_captcha[Captcha is enforced on identifier and password steps<br/>when tenant policy requires it.<br/>Social, enterprise SSO, one-time token, and passkey verification skip captcha.]
  note_sso_recheck[Email password sign-in rechecks enterprise SSO<br/>before local password verification.]
  note_skip_verify[Enterprise SSO and passkey sign-in skip the initial MFA verification gate.]
  note_profile[Enterprise SSO sign-in bypasses the required-profile gate.<br/>Verified social sign-in may also bypass it when tenant settings allow skipping required identifiers.]
  note_social_link[Related-user detection for social sign-in is based on the social profile's<br/>verified email or phone. Automatic account linking can bypass the choice page.]
  note_sso_link[Enterprise SSO has no separate manual linking page here.<br/>If no direct SSO identity exists, the backend auto-falls back<br/>to a related user matched by verified email.]

  note_captcha -.-> id0
  note_captcha -.-> pw1
  note_sso_recheck -.-> pw0
  note_skip_verify -.-> mfa_verify_gate
  note_profile -.-> profile_gate
  note_social_link -.-> so3
  note_sso_link -.-> sso4

  subgraph AfterIdentify["Post-identification sign-in completion"]
    identified[User identified for sign-in]
    identified --> submit[Check whether sign-in can be completed]

    submit --> mfa_verify_gate{Existing MFA must be verified now}
    mfa_verify_gate -->|yes| mfa_verify[MFA verification]
    mfa_verify_gate -->|no| profile_gate

    mfa_verify --> submit

    profile_gate{Missing required profile}
    profile_gate -->|yes| continue_flow[Continue pages]
    profile_gate -->|no| sso_bypass{Signed in through enterprise SSO}

    continue_flow --> continue_data[Collect missing profile data<br/>or missing identifier]
    continue_data --> submit

    sso_bypass -->|yes| done([OIDC redirect])
    sso_bypass -->|no| passkey_enabled{Passkey sign-in enabled}

    passkey_enabled -->|no| mfa_policy
    passkey_enabled -->|yes| passkey_bound{Passkey (WebAuthn)<br/>already bound}

    passkey_bound -->|yes| mfa_policy
    passkey_bound -->|no| create_passkey[Create passkey page]

    create_passkey --> create_passkey2[Bind passkey or skip]
    create_passkey2 --> submit

    mfa_policy{MFA mandatory now<br/>or required by organization}
    mfa_policy -->|yes| mfa_missing
    mfa_policy -->|no| mfa_onboarding_needed{Optional MFA onboarding<br/>should be shown}

    mfa_onboarding_needed -->|yes| mfa_on[MFA onboarding]
    mfa_onboarding_needed -->|no| mfa_missing

    mfa_on --> mfa_on2[Enable MFA or skip]
    mfa_on2 -->|skip| done
    mfa_on2 -->|enable| mfa_missing

    mfa_missing{Missing required MFA factor}
    mfa_missing -->|yes| mfa_bind[MFA binding or factor page]
    mfa_missing -->|no| mfa_suggestion{Suggest an additional MFA factor}

    mfa_bind --> mfa_bind2[Verify or bind authenticator app,<br/>passkey, email, or phone]
    mfa_bind2 --> submit

    mfa_suggestion -->|yes| mfa_suggestion_bind[Additional MFA factor suggestion]
    mfa_suggestion -->|no| backup_gate{Backup code enabled<br/>and still missing or empty}

    mfa_suggestion_bind --> mfa_suggestion_bind2[Bind another factor or skip suggestion]
    mfa_suggestion_bind2 --> submit

    backup_gate -->|yes| backup[Backup code binding]
    backup_gate -->|no| done([OIDC redirect])

    backup --> backup2[Generate and save backup codes]
    backup2 --> submit
  end
```
