# Sign-in experience API setup (dev)

Requires `API` and `HDR` from the skill (e.g. `development-user-id: dev`).

## Baseline: username + password sign-up/sign-in

```bash
curl -s -X PATCH "$API/sign-in-exp" $HDR -d '{
  "signInMode": "SignInAndRegister",
  "signUp": { "identifiers": ["username"], "password": true, "verify": false },
  "signIn": {
    "methods": [{
      "identifier": "username",
      "password": true,
      "verificationCode": false,
      "isPasswordPrimary": true
    }]
  }
}'
```

## Inspect current config

```bash
curl -s "$API/sign-in-exp" $HDR | jq '{signInMode, signUp, signUpProfileFields}'
curl -s "$API/custom-profile-fields" $HDR | jq '[.[] | {name, type, required}]'
```

## Custom test app (only if demo-app is not enough)

Built-in `demo-app` is preferred. Otherwise create a SPA and set `redirectUris` to `http://localhost:3001/<appId>`, then use OIDC auth URL with that `client_id`.
