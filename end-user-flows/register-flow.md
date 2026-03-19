# Register flow sample

```mermaid
flowchart TD
  start([Registration entry])

  subgraph EntryPoints["Register entry points"]
    id0[Identifier sign-up page]
    so0[Social callback after third-party auth]
    ml0[One-time token landing]
    sso0[Enterprise SSO callback]
  end

  start --> id0
  start --> so0
  start --> ml0
  start --> sso0

  subgraph Identifier["Identifier sign-up"]
    id0 --> id1{Primary identifier}
    id1 -->|username| idu1[Start register interaction<br/>optional captcha]
    idu1 --> idu2[Save username to pending profile]
    idu2 --> idu3{Password required<br/>and no secondary identifiers}
    idu3 -->|yes| cont_pw[Continue password page]
    idu3 -->|no| reg_attempt

    id1 -->|email or phone| idv1[Start register interaction<br/>optional captcha]
    idv1 --> idv2[send verification code]
    idv2 --> idv3[verify code]
    idv3 --> reg_verified[Submit verified identifier<br/>for registration]
  end

  cont_pw --> continue_flow
  reg_verified --> reg_attempt

  subgraph Social["Register via social"]
    so0 --> so1[Start sign-in attempt]
    so1 --> so2[verify social callback<br/>captcha skipped]
    so2 --> so3{Existing social identity<br/>or related user found}
    so3 -->|yes| out_social[Link or sign-in path<br/>outside this register sample]
    so3 -->|no| so4[Switch to register flow<br/>with verified social identity]
  end

  so4 --> reg_attempt

  subgraph MagicLink["Register via one-time token"]
    ml0 --> ml1[Start sign-in attempt]
    ml1 --> ml2[verify one-time token<br/>captcha skipped]
    ml2 --> ml3{User exists}
    ml3 -->|yes| out_ml[Sign-in path outside this register sample]
    ml3 -->|no| ml4[Switch to register flow<br/>with verified one-time token]
  end

  ml4 --> reg_attempt

  subgraph EnterpriseSSO["Register via enterprise SSO"]
    sso0 --> sso1[Start sign-in attempt]
    sso1 --> sso2[verify SSO callback<br/>captcha skipped]
    sso2 --> sso3{SSO identity or related user found}
    sso3 -->|yes| out_sso[Sign-in or related-user path<br/>outside this register sample]
    sso3 -->|no| sso4[Switch to register flow<br/>with verified enterprise identity]
  end

  sso4 --> reg_attempt

  subgraph RegisterBackend["Shared register backend path"]
    reg_attempt[Submit registration identification]
    reg_attempt --> create_user[Create user from pending interaction data<br/>verified identifier optional]
    create_user --> profile_gate{Missing required profile<br/>before user creation}
    profile_gate -->|yes| continue_flow[Continue pages]
    profile_gate -->|no| created[user created and userId stored]

    continue_flow --> cont1[Save missing profile data<br/>or newly verified identifier]
    cont1 --> cont2[Retry registration after profile completion]
    cont2 --> create_user

    created --> submit[Submit interaction]
  end

  note_profile[No missing-profile gate for enterprise SSO registration.<br/>Social registration may also bypass it when<br/>tenant settings allow skipping required identifiers.]
  note_captcha[Captcha is enforced on identifier entry when policy requires it.<br/>Social, enterprise SSO, and one-time token verification skip captcha.]

  note_profile -.-> profile_gate
  note_captcha -.-> idu1
  note_captcha -.-> idv1

  subgraph AfterSubmit["Post-create continuation after submit"]
    submit --> sso_bypass{Registered through enterprise SSO?}
    sso_bypass -->|yes| done([OIDC redirect])
    sso_bypass -->|no| passkey_gate{Passkey sign-in preferred<br/>and no passkey bound?}

    passkey_gate -->|yes| passkey[Create passkey page]
    passkey_gate -->|no| mfa_gate{MFA fulfillment needed}

    passkey --> passkey2[bind passkey or skip]
    passkey2 --> submit

    mfa_gate -->|suggest enabling MFA| mfa_on[MFA onboarding]
    mfa_gate -->|require at least one MFA factor| mfa_bind[MFA binding or factor page]
    mfa_gate -->|suggest another MFA factor| mfa_bind
    mfa_gate -->|require backup codes| backup[Backup code binding]
    mfa_gate -->|fulfilled| done

    mfa_on --> mfa_on2[enable MFA or skip]
    mfa_on2 --> submit

    mfa_bind --> mfa_bind2[bind authenticator app, passkey, email, or phone]
    mfa_bind2 --> submit

    backup --> backup2[generate and save backup codes]
    backup2 --> submit
  end
```
