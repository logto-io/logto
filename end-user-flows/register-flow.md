# Register flow

```mermaid
flowchart TD
  start([Registration entry])

  subgraph EntryPoints["Register entry points"]
    id0[Identifier sign-up page]
    so0[Social sign-in]
    ml0["One-time token (magic link)"]
    sso0[Enterprise SSO]
  end

  start --> id0
  start --> so0
  start --> ml0
  start --> sso0

  subgraph Identifier["Identifier sign-up"]
    id0 --> id1{Primary identifier}
    id1 -->|username| idu1[Start register interaction<br/>optional captcha]
    idu1 --> idu2[Submit username for registration]
    idu2 --> reg_attempt

    id1 -->|email| ide1{Check whether enterprise SSO should take over}
    ide1 -->|yes| sso_redirect[Redirect to enterprise SSO]
    ide1 -->|no| ide2[Start register interaction<br/>optional captcha]

    id1 -->|phone| idv1[Start register interaction<br/>optional captcha]

    ide2 --> id_method_ui[Resolve selected identifier method<br/>against sign-up methods exposed by current<br/>sign-in experience settings]
    idv1 --> id_method_ui
    id_method_ui --> idv2[Send verification code]
    idv2 --> idv3[Verify code]
    idv3 --> reg_verified[Submit verified identifier<br/>for registration]
  end

  reg_verified --> reg_attempt

  subgraph Social["Register via social sign-in"]
    so0 --> so1[Start sign-in attempt]
    so1 --> so2[Verify social callback<br/>captcha skipped]
    so2 --> so3{Related user found by<br/>verified email or phone}
    so3 -->|no| so5[Switch to register flow<br/>with verified social identity]
    so3 -->|yes| so4[Account linking choice]
    so4 -->|Bind existing account| out_social_link[Account-linking and sign-in path<br/>outside this register flow]
    so4 -->|Create new account instead| so5
  end

  so5 --> reg_attempt

  subgraph MagicLink["Register via one-time token"]
    ml0 --> ml1[Start sign-in attempt]
    ml1 --> ml2[Verify one-time token<br/>captcha skipped]
    ml2 --> ml3{User exists}
    ml3 -->|yes| out_ml[Sign-in path outside this register flow]
    ml3 -->|no| ml4[Switch to register flow<br/>with verified one-time token]
  end

  ml4 --> reg_attempt

  subgraph EnterpriseSSO["Register via enterprise SSO"]
    sso_redirect --> sso1[Authenticate with enterprise IdP]
    sso0 --> sso1
    sso1 --> sso2[Return from enterprise IdP]
    sso2 --> sso2b[Verify SSO callback<br/>captcha skipped]
    sso2b --> sso3{Existing enterprise identity found}
    sso3 -->|yes| out_sso[Direct sign-in path<br/>outside this register flow]
    sso3 -->|no| sso4{Related user found by<br/>verified email}
    sso4 -->|yes| out_sso_link[Auto-link enterprise identity<br/>and sign in outside this register flow]
    sso4 -->|no| sso5[Switch to register flow<br/>with verified enterprise identity]
  end

  sso5 --> reg_attempt

  reg_attempt[Submit registration identification]

  subgraph RegisterBackend["Profile fulfillment and user creation"]
    reg_attempt --> existing_id{Identifier already used<br/>by an existing account}
    existing_id -->|yes| out_existing_id[Suggest sign-in flow<br/>with the same identifier]
    out_existing_id --> out_existing_id_done([Exit register flow<br/>and restart in sign-in])
    existing_id -->|no| missing_required_identifier{"Missing required sign-up identifiers?<br/>(Username, email, or phone)"}

    missing_required_identifier -->|no| required_password{Required password?}
    missing_required_identifier -->|yes| fulfill_missing_identifiers[Fulfill missing identifiers]

    fulfill_missing_identifiers --> required_password
    required_password -->|yes| fulfill_password[Fulfill password]
    required_password -->|no| collect_custom_profile_enabled{Is collecting custom profile fields enabled?}
    fulfill_password -->  collect_custom_profile_enabled

    collect_custom_profile_enabled -->|yes| collect_custom_profile[Fulfill custom user profile fields]
    collect_custom_profile_enabled -->|no| create_user[Create user from interaction data]
    collect_custom_profile --> create_user
  end

  note_captcha[Captcha is enforced on identifier entry when policy requires it.<br/>Social, enterprise SSO, and one-time token verification skip captcha.]
  note_identifier_method[The register page only exposes identifier methods allowed by the current sign-in experience.<br/>Email and phone verification-code registration therefore starts from the enabled sign-up methods on the page.]
  note_social_link[When automatic account linking is enabled,<br/>the related-user branch skips the choice page<br/>and proceeds directly to account-linking sign-in.]
  note_sso_recheck[Email registration checks enterprise SSO twice:<br/>the experience UI can redirect to SSO before sending a code,<br/>and the backend rechecks SSO-only email before local user creation.]
  note_sso_link[Enterprise SSO does not have a manual linking page here.<br/>If no direct SSO identity exists, the backend auto-falls back<br/>to a related user matched by verified email.]

  note_captcha -.-> idu1
  note_captcha -.-> ide2
  note_captcha -.-> idv1
  note_identifier_method -.-> id_method_ui
  note_social_link -.-> so5
  note_sso_recheck -.-> ide1
  note_sso_recheck -.-> reg_attempt
  note_sso_link -.-> sso4

  subgraph PasskeyBinding["Passkey sign-in handling"]
    create_user --> sso_bypass{Registered through enterprise SSO?}
    sso_bypass -->|yes| skip_passkey
    sso_bypass -->|no| passkey_enabled{Passkey sign-in enabled?}

    passkey_enabled -->|no| skip_passkey
    passkey_enabled -->|yes| passkey_bound{"Passkey (WebAuthn) bound?"}

    passkey_bound -->|yes| skip_passkey
    passkey_bound -->|no| bind_passkey[Bind passkey]
  end

  subgraph MfaFlow["MFA handling"]
    skip_passkey[Skip passkey setup] --> mfa_policy
    bind_passkey --> mfa_policy

    mfa_policy{MFA mandatory now<br/>or required by organization?}
    mfa_policy -->|no| mfa_onboarding{MFA onboarding:<br/>Enable or skip?}

    mfa_onboarding -->|skip| submit
    mfa_onboarding -->|enable| mfa_missing

    mfa_policy -->|yes| mfa_missing

    mfa_missing{Missing required MFA factor?}
    mfa_missing -->|yes| mfa_bind[MFA binding or factor page]
    mfa_missing -->|no| mfa_suggestion{Suggest an additional MFA factor?}

    mfa_bind --> mfa_bind2[Bind authenticator app, passkey, email, or phone]
    mfa_bind2 --> backup_gate

    mfa_suggestion -->|yes| mfa_suggestion_bind[Additional MFA factor suggestion]
    mfa_suggestion -->|no| backup_gate{Backup code enabled<br/>and still missing or empty?}

    mfa_suggestion_bind --> mfa_suggestion_bind2[Bind another factor or skip suggestion]
    mfa_suggestion_bind2 --> backup_gate

    backup_gate -->|yes| backup[Backup code binding]
    backup_gate -->|no| submit[Submit interaction]

    backup --> backup2[Generate and save backup codes]
    backup2 --> submit
  end

  submit --> done([OIDC redirect])
```
