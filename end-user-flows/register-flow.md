# Register flow

## Registration entries

```mermaid
flowchart TD
  start([Registration entry])

  subgraph EntryPoints["Register entry points"]
    id0[Identifier sign-up page]
    sso0[Enterprise SSO]
    so0[Social sign-in]
    ml0["One-time token (magic link)"]
  end

  start --> id0
  start --> sso0
  start --> so0
  start --> ml0

  subgraph Identifier["Identifier sign-up"]
    id0 --> id1{Primary identifier}
    id1 -->|username| idu1[Start register interaction<br/>optional captcha]
    idu1 --> idu2[Submit username for registration]

    id1 -->|phone| idv1[Start register interaction<br/>optional captcha]
    idv1 --> id_method_ui

    id1 -->|email| ide1{Check whether enterprise SSO should take over}
    ide1 -->|yes| sso_redirect[Redirect to enterprise SSO]
    ide1 -->|no| ide2[Start register interaction<br/>optional captcha]

    ide2 --> id_method_ui[Render identifier verification options<br/>enabled for this sign-up page]
    id_method_ui --> idv2[Send verification code]
    idv2 --> idv3[Verify code]
    idv3 --> reg_verified[Submit verified identifier<br/>for registration]
  end

  subgraph EnterpriseSSO["Register via enterprise SSO"]
    sso_redirect --> sso1[Authenticate with enterprise IdP]
    sso0 --> sso1
    sso1 --> sso2[Return from enterprise IdP]
    sso2 --> sso2b[Verify SSO callback<br/>captcha skipped]
    sso2b --> sso3{Existing enterprise identity found}
    sso3 -->|yes| out_sso([Automatically sign in with enterprise identity<br/>outside this register flow])
    sso3 -->|no| sso4{Related user found by<br/>verified email}
    sso4 -->|yes| out_sso_link([Auto-link enterprise identity<br/>and sign in outside this register flow])
    sso4 -->|no| sso5[User identified with<br/>verified enterprise identity]
  end

  subgraph Social["Register via social sign-in"]
    so0 --> so1[Start sign-in attempt]
    so1 --> so2[Verify social callback<br/>captcha skipped]
    so2 --> so2b{Existing social identity found}
    so2b -->|yes| out_social_existing([Automatically sign in with social identity<br/>outside this register flow])
    so2b -->|no| so3{Related user found by social identity,<br/>verified email or phone}
    so3 -->|yes| so4{Automatic account linking enabled}
    so4 -->|yes| out_social_auto_link([Auto-link social identity<br/>and sign in outside this register flow])
    so4 -->|no| so5[Open account-linking page]
    so5 --> so5_choice{Choose link or create another account}
    so5_choice -->|Bind existing account| out_social_sign_in([Switch to sign-in flow<br/>with verified social identity])
    so5_choice -->|Create another account| so6[User identified with<br/>verified social identity]
    so3 -->|no| so6
  end

  subgraph MagicLink["Register via one-time token"]
    ml0 --> ml1[Start sign-in attempt]
    ml1 --> ml2[Verify one-time token<br/>captcha skipped]
    ml2 --> ml3{User exists}
    ml3 -->|yes| out_ml([Sign-in path outside this register flow])
    ml3 -->|no| ml4[User identified with<br/>verified one-time token]
  end

  reg_attempt(["Submit registration identification -> Profile fulfillment"])
  idu2 --> reg_attempt
  reg_verified --> reg_attempt
  sso5 --> reg_attempt
  so6 --> reg_attempt
  ml4 --> reg_attempt
```

## Profile fulfillment and user creation

```mermaid
flowchart TD
  reg_attempt([Submit registration identification]) --> existing_id{Identifier already used<br/>by an existing account}

  subgraph RegisterBackend["Profile fulfillment and user creation"]
    existing_id -->|yes| existing_id_sign_in_enabled{Current verification method<br/>enabled for sign-in?}
    existing_id_sign_in_enabled -->|yes| out_existing_id[Suggest sign-in flow<br/>with the same identifier]
    existing_id_sign_in_enabled -->|no| out_existing_id_error([Stay on register<br/>and show identity-exists error])
    out_existing_id --> out_existing_id_done([Exit register flow<br/>and restart in sign-in])
    existing_id -->|no| profile_skip_sso{Registered through enterprise SSO?}
    profile_skip_sso -->|no| missing_required_identifier{"Missing required sign-up identifiers?<br/>(Username, email, or phone)"}

    fulfill_missing_identifiers --> social_identifier_conflict{Social-linked email or phone<br/>already belongs to an existing user?}
    social_identifier_conflict -->|yes| social_continue_link[Prompt to bind the social identity<br/>to the existing account]
    social_identifier_conflict -->|no| required_password

    missing_required_identifier -->|no| required_password{Required password?}
    missing_required_identifier -->|yes| fulfill_missing_identifiers[Fulfill missing identifiers]

    social_continue_link --> out_social_continue_link([Bind social identity and sign in<br/>outside this register flow])
    required_password -->|yes| fulfill_password[Fulfill password]
    required_password -->|no| collect_custom_profile_enabled{Is collecting custom profile fields enabled?}
    fulfill_password --> collect_custom_profile_enabled

    collect_custom_profile_enabled -->|yes| collect_custom_profile[Fulfill custom user profile fields]
    collect_custom_profile_enabled -->|no| create_user
    collect_custom_profile --> create_user
    profile_skip_sso -->|yes| create_user[Create user from interaction data]
  end

  create_user --> submit_gates[["ExperienceInteraction.submit() gates (see submit-gates.md)"]]
  submit_gates --> done([OIDC redirect])
```

## Post-creation submit & MFA gates

After creating the user, `ExperienceInteraction.submit()` runs the shared gate sequence in [submit-gates.md](./submit-gates.md):

- **Register**: Runs `guardUnreachableRequestedAcr()` instead of `guardFirstFactor()`, skips `guardMfaVerificationStatus()`, and runs mandatory profile, passkey prompt, `assertMfaFulfilled()`, trusted-device opt-in (when an eligible MFA factor was bound), and final ACR assertion.
- **Enterprise SSO / Social registration**: Enterprise SSO skips mandatory profile, passkey prompt, and `assertMfaFulfilled()` (unless requested `mfa` ACR or requested enrollment factors apply); Social skips mandatory profile when `skipRequiredIdentifiers` is enabled.
