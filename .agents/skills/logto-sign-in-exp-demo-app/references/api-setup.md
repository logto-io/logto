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

## Collect user profile (example: avatar + first name)

Avatar upload requires [logto-local-storage](../../logto-local-storage/SKILL.md).

```bash
curl -s -X POST "$API/custom-profile-fields" $HDR \
  -d '{"name":"avatar","type":"Url","required":false}'
curl -s -X POST "$API/custom-profile-fields" $HDR \
  -d '{"name":"givenName","type":"Text","label":"First name","required":true,"config":{"minLength":1,"maxLength":100}}'
curl -s -X POST "$API/custom-profile-fields" $HDR \
  -d '{"name":"familyName","type":"Text","label":"Last name","required":true,"config":{"minLength":1,"maxLength":100}}'
curl -s -X POST "$API/custom-profile-fields" $HDR \
  -d '{"name":"birthdate","type":"Date","label":"Birthdate","required":false,"config":{"format":"yyyy-MM-dd"}}'
curl -s -X POST "$API/custom-profile-fields" $HDR \
  -d '{"name":"gender","type":"Select","label":"Gender","required":false,"config":{"options":[{"value":"female","label":"Female"},{"value":"male","label":"Male"},{"value":"prefer_not_to_say","label":"Prefer not to say"}]}}'

curl -s -X PATCH "$API/sign-in-exp" $HDR -d '{
  "signUpProfileFields": [
    {"name": "avatar"},
    {"name": "givenName"},
    {"name": "familyName"},
    {"name": "birthdate"},
    {"name": "gender"}
  ]
}'

curl -s -X PATCH "$API/account-center" $HDR -d '{
  "fields": {
    "name": "Edit",
    "avatar": "Edit",
    "profile": "Edit",
    "username": "Edit",
    "email": "Edit",
    "phone": "Edit",
    "password": "Edit",
    "social": "Edit",
    "customData": "Edit",
    "mfa": "Edit"
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
