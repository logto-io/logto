# Logto Environment-Based Bootstrap

This guide explains how to configure Logto for **zero-click setup** in ephemeral or containerised environments. By setting environment variables before the first `db seed`, you can pre-configure an admin user, OIDC application, SMTP email connector, seed user accounts, sign-in experience, and MFA factors — all without touching the Admin Console.

## How It Works

The bootstrap runs automatically as part of `pnpm cli db seed` (or `npm run cli db seed`). When the `--swe` (skip-when-exists) flag is used (as in the default Docker entrypoint), the bootstrap only runs on first initialization. If no bootstrap environment variables are set, the seed process behaves exactly as before.

The typical Docker entrypoint is:

```bash
npm run cli db seed -- --swe && npm start
```

This means: seed (and bootstrap) only on the first run, then start the server.

## Environment Variables

### Admin User

Create a fully-provisioned admin user in the admin tenant with management roles and default tenant organization membership. This replaces the manual first-admin sign-up flow.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_ADMIN_USERNAME` | Yes | Admin account username |
| `LOGTO_ADMIN_PASSWORD` | Yes | Admin account password (plaintext; hashed with Argon2i during seed) |
| `LOGTO_ADMIN_EMAIL` | No | Admin account email address |

> **Note:** Both `LOGTO_ADMIN_USERNAME` and `LOGTO_ADMIN_PASSWORD` must be set to trigger admin user creation.

The admin user is provisioned with:

- `AdminTenantRole.User` role in the admin tenant
- Legacy Management API admin role (OSS: `default:admin`)
- Membership in the default tenant organisation with the `Admin` role
- The admin tenant sign-in experience is set to "sign-in only" to prevent unwanted registrations

### M2M Application (Management API Client)

Create a Machine-to-Machine (M2M) application in the default tenant and automatically assign it the "Logto Management API access" role. The resulting credentials can be used directly with the `client_credentials` grant to call the Management API — for example, to create users programmatically.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_M2M_CLIENT_ID` | Yes | M2M Client ID (**max 21 characters** — database constraint) |
| `LOGTO_M2M_CLIENT_SECRET` | Yes | M2M Client Secret |
| `LOGTO_M2M_APP_NAME` | No | Application display name (default: `"Management API Client"`) |

> **Note:** Both `LOGTO_M2M_CLIENT_ID` and `LOGTO_M2M_CLIENT_SECRET` must be set to trigger M2M application creation.

> **Important:** The Client ID is stored as the application's primary key in the database, which has a `varchar(21)` constraint. Keep your Client ID to 21 characters or fewer.

The created application:

- Type: `MachineToMachine`
- Automatically assigned the **"Logto Management API access"** role (grants the `all` scope on the Management API resource)
- Client secret is stored both in the legacy `applications.secret` column and the `application_secrets` table

**Getting a Management API token after bootstrap:**

```bash
curl -X POST https://[your-endpoint]/oidc/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=YOUR_M2M_CLIENT_ID' \
  -d 'client_secret=YOUR_M2M_CLIENT_SECRET' \
  -d 'resource=https://default.logto.app/api' \
  -d 'scope=all'
```

Where `[your-endpoint]` will be the User Console URL.

From here, you can use the returned `accessToken` as a HTTP Bearer Token to
interact with the management API.

Example to create a new User:

```bash
curl -X POST 'https://[your-endpoint]/api/users' \
-H 'Authorization: Bearer <accessToken> \
--json '{ "primaryEmail": "john3@example.com", "password": "SecurePassword123", "profile": { "givenName": "John", "familyName": "Doe" } }'
```

### OIDC Application

Create a Traditional (confidential) OIDC application in the default tenant with user-specified client credentials. Ideal for Authorization Code Grant flows with a backend application.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_APP_NAME` | No | Application display name (default: `"My Application"`) |
| `LOGTO_APP_CLIENT_ID` | Yes | OIDC Client ID (**max 21 characters** — database constraint) |
| `LOGTO_APP_CLIENT_SECRET` | Yes | OIDC Client Secret |
| `LOGTO_APP_REDIRECT_URIS` | Yes | Comma-separated list of OAuth callback URIs |
| `LOGTO_APP_POST_LOGOUT_REDIRECT_URIS` | No | Comma-separated list of post-logout redirect URIs |

> **Note:** All three of `LOGTO_APP_CLIENT_ID`, `LOGTO_APP_CLIENT_SECRET`, and `LOGTO_APP_REDIRECT_URIS` must be set to trigger application creation.

> **Important:** The Client ID is stored as the application's primary key in the database, which has a `varchar(21)` constraint. Keep your Client ID to 21 characters or fewer.

The created application:

- Type: `Traditional` (confidential web application)
- Supports Authorization Code Grant with `client_secret`
- Client secret is stored both in the legacy `applications.secret` column and the `application_secrets` table

### SMTP Email Connector

Configure the SMTP email connector in the default tenant. Default email templates for Register, SignIn, ForgotPassword, and Generic verification flows are included automatically.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_SMTP_HOST` | Yes | SMTP server hostname (e.g., `smtp.example.com`) |
| `LOGTO_SMTP_PORT` | Yes | SMTP server port (e.g., `587`, `465`, `25`) |
| `LOGTO_SMTP_USERNAME` | Yes | SMTP authentication username |
| `LOGTO_SMTP_PASSWORD` | Yes | SMTP authentication password |
| `LOGTO_SMTP_FROM_EMAIL` | Yes | Sender email address (e.g., `noreply@example.com`) |
| `LOGTO_SMTP_REPLY_TO` | No | Reply-to email address |
| `LOGTO_SMTP_SECURE` | No | Use TLS (`true` or `false`, default: `false`) |

> **Note:** All five required variables must be set to trigger SMTP connector creation.

Default email templates use a simple HTML format:

```html
<p>Your verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>
```

### SMTP SMS Connector

Configure the SMTP SMS connector (custom Service Vic connector) in the default tenant. Sends SMS messages via an email-to-SMS gateway using SMTP. Default plain-text templates for Register, SignIn, ForgotPassword, and Generic verification flows are included automatically.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_SMTP_SMS_HOST` | Yes | SMTP server hostname (e.g., `smtp.example.com`) |
| `LOGTO_SMTP_SMS_PORT` | Yes | SMTP server port (e.g., `587`, `465`, `25`) |
| `LOGTO_SMTP_SMS_USERNAME` | Yes | SMTP authentication username |
| `LOGTO_SMTP_SMS_PASSWORD` | Yes | SMTP authentication password |
| `LOGTO_SMTP_SMS_FROM_EMAIL` | Yes | Sender email address |
| `LOGTO_SMTP_SMS_TO_EMAIL_TEMPLATE` | Yes | Gateway address template (e.g., `{{phoneNumberOnly}}@txt.att.net`) |
| `LOGTO_SMTP_SMS_SUBJECT` | No | Optional email subject line (most SMS gateways ignore this) |
| `LOGTO_SMTP_SMS_SECURE` | No | Use TLS (`true` or `false`, default: `false`) |

> **Note:** All six required variables must be set to trigger SMTP SMS connector creation.

The `LOGTO_SMTP_SMS_TO_EMAIL_TEMPLATE` supports two placeholders:

| Placeholder | Value | Example |
|---|---|---|
| `{{phoneNumberOnly}}` | Digits only (non-numeric chars stripped) | `12025551234` |
| `{{phone}}` | Raw phone number as supplied by Logto | `+12025551234` |

**Common carrier gateways (USA):**

| Carrier | Template |
|---|---|
| AT&T | `{{phoneNumberOnly}}@txt.att.net` |
| Verizon | `{{phoneNumberOnly}}@vtext.com` |
| T-Mobile | `{{phoneNumberOnly}}@tmomail.net` |

### Seeded User Accounts

Pre-create user accounts in the default tenant from a CSV or JSON file.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_SEED_USERS_FILE` | No | Absolute path to a `.json` or `.csv` file containing user accounts |

#### JSON Format

```json
[
  {
    "email": "jdoe@example.com",
    "password": "s3cret",
    "username": "jdoe",
    "name": "John Doe",
    "familyName": "Doe",
    "givenName": "John"
  },
  {
    "email": "asmith@example.com",
    "password": "p@ssw0rd",
    "name": "Alice Smith",
    "familyName": "Smith"
  }
]
```

#### CSV Format

```csv
email,password,username,name,familyName,givenName
jdoe@example.com,s3cret,jdoe,John Doe,Doe,John
asmith@example.com,p@ssw0rd,,Alice Smith,Smith,
```

#### Field Reference

| Field | Required | Description |
|---|---|---|
| `email` | Yes | User's primary email address (used as the sign-in identifier) |
| `password` | Yes | Password (plaintext; hashed with Argon2i during seed) |
| `username` | No | Optional username |
| `name` | No | Display name |
| `familyName` | No | Family name (stored in OIDC `profile.family_name` claim) |
| `givenName` | No | Given name (stored in OIDC `profile.given_name` claim) |

Users are created in the **default tenant** and can sign in through any OIDC application configured in that tenant.

### Sign-In Experience

Configure the default tenant's sign-in and sign-up flow.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_BOOTSTRAP_SIGNIN_EXPERIENCE` | No | Set to `true` to apply sign-in experience configuration |
| `LOGTO_SIGN_IN_IDENTIFIER` | No | Primary identifier: `email` or `username` (default: `username`). Only applies when `LOGTO_BOOTSTRAP_SIGNIN_EXPERIENCE=true` |

When `LOGTO_BOOTSTRAP_SIGNIN_EXPERIENCE=true`, the default tenant sign-in experience is configured for:

- **Sign-up**: Identifier + password with verification (email requires email verification)
- **Sign-in**: Identifier + password (primary), with verification code fallback
- **Custom profile fields**: Given name and family name fields are added and marked as required at registration

> **Note:** SMTP must be independently configured (via `LOGTO_SMTP_*` variables or the Admin Console) for email-based sign-in or verification to work.

### MFA Factors

Enable one or more MFA factors in the default tenant's sign-in experience.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_MFA_FACTORS` | No | Comma-separated list of MFA factors to enable (case-insensitive) |

**Accepted values:**

| Token | MFA Factor |
|-------|------------|
| `totp` | Authenticator app (TOTP) |
| `webauthn` | Passkeys / WebAuthn |
| `backupCode` | Backup codes |
| `emailVerificationCode` | Email one-time code |
| `phoneVerificationCode` | SMS one-time code |

**Example:**

```
LOGTO_MFA_FACTORS=totp,webauthn,backupCode
```

> **Note:** This only enables the listed factors. The MFA *policy* (whether MFA is required or optional) is left at its seeded default (`UserControlled`). Adjust the policy via the Admin Console after bootstrapping.

### Phone Input Default Country Code

Set the default country code pre-selected in the phone number input in the account center.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_DEFAULT_PHONE_COUNTRY_CODE` | No | ISO 3166-1 alpha-2 country code (e.g. `AU`, `US`, `GB`). Must be a valid country code recognised by `libphonenumber-js`. |

When not set, the default is determined by the user's browser language (`en` → `US`, `zh` → `CN`, etc.). If set to an invalid or unrecognised code the variable is silently ignored and the language-based fallback applies.

**Example — default to Australia (+61):**

```
LOGTO_DEFAULT_PHONE_COUNTRY_CODE=AU
```

> **Note:** This variable is read at **runtime** by the Logto server and injected into the account center HTML on each request as `window.__logtoConfig__`. Set it in the server/container environment — no rebuild is required. This only applies to the account center; the sign-in/sign-up experience still derives the default from the browser language.

## Automatic Configuration

The following changes are applied automatically whenever the bootstrap runs (i.e. when at least one environment variable is set), regardless of which specific variables are present.

### Account Centre

The Account Centre for the default tenant is **enabled** with the following fields set to **Edit**:

| Field | Description |
|-------|-------------|
| `password` | Users can set or change their password |
| `email` | Users can update their primary email address |
| `name` | Users can update their display name |
| `profile` | Users can edit their given name, family name, and avatar |
| `mfa` | Users can configure or remove MFA methods (TOTP, passkeys, backup codes) |
| `phone` | Users can update their phone number (**only enabled when `LOGTO_SMTP_SMS_*` is configured**; set to `Off` otherwise) |

This allows end-users to self-manage their credentials and profile via the Account Centre SPA without further configuration.

## Docker Compose Example

```yaml
version: '3.9'

services:
  logto:
    image: ghcr.io/logto-io/logto:latest
    entrypoint:
      - /bin/sh
      - -c
      - |
        npm run cli db seed -- --swe && npm start
    environment:
      # Core Logto configuration
      - DB_URL=postgres://postgres:p0stgr3s@postgres:5432/logto
      - ENDPOINT=http://localhost:3001
      - ADMIN_ENDPOINT=http://localhost:3002
      - TRUST_PROXY_HEADER=1

      # Bootstrap: Admin user
      - LOGTO_ADMIN_USERNAME=admin
      - LOGTO_ADMIN_PASSWORD=MySecureP@ssword123

      # Bootstrap: M2M Application (Management API client)
      - LOGTO_M2M_APP_NAME=My Management API Client
      - LOGTO_M2M_CLIENT_ID=my-m2m-client
      - LOGTO_M2M_CLIENT_SECRET=my-m2m-secret-key-1234

      # Bootstrap: OIDC Application
      - LOGTO_APP_NAME=My Web App
      - LOGTO_APP_CLIENT_ID=my-web-app
      - LOGTO_APP_CLIENT_SECRET=my-super-secret-key-1234
      - LOGTO_APP_REDIRECT_URIS=http://localhost:8080/callback
      - LOGTO_APP_POST_LOGOUT_REDIRECT_URIS=http://localhost:8080

      # Bootstrap: SMTP Email Connector
      - LOGTO_SMTP_HOST=smtp.example.com
      - LOGTO_SMTP_PORT=587
      - LOGTO_SMTP_USERNAME=noreply@example.com
      - LOGTO_SMTP_PASSWORD=smtp-password
      - LOGTO_SMTP_FROM_EMAIL=noreply@example.com

      # Bootstrap: SMTP SMS Connector (Service Vic custom connector)
      - LOGTO_SMTP_SMS_HOST=smtp.example.com
      - LOGTO_SMTP_SMS_PORT=587
      - LOGTO_SMTP_SMS_USERNAME=noreply@example.com
      - LOGTO_SMTP_SMS_PASSWORD=smtp-password
      - LOGTO_SMTP_SMS_FROM_EMAIL=noreply@example.com
      - LOGTO_SMTP_SMS_TO_EMAIL_TEMPLATE={{phoneNumberOnly}}@txt.att.net

      # Bootstrap: Sign-in experience (email-primary with custom profile fields)
      - LOGTO_SIGN_IN_IDENTIFIER=email
      - LOGTO_BOOTSTRAP_SIGNIN_EXPERIENCE=true

      # Bootstrap: MFA factors
      - LOGTO_MFA_FACTORS=totp,webauthn,backupCode

      # Bootstrap: Seeded users (mount the file into the container)
      - LOGTO_SEED_USERS_FILE=/data/seed-users.json
    volumes:
      - ./seed-users.json:/data/seed-users.json:ro
    ports:
      - '3001:3001'
      - '3002:3002'
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: p0stgr3s
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready']
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Behaviour Notes

1. **Idempotent via `--swe`:** The bootstrap runs inside the `db seed` transaction. With `--swe`, seeding (and bootstrap) is skipped if the database already exists. This means bootstrap data is created once on first init.

2. **Account Centre always configured:** Whenever any bootstrap variable is set, the Account Centre for the default tenant is enabled with password, email, profile, and MFA editing turned on. No additional environment variable is required.

3. **Transactional:** All bootstrap operations run within the same database transaction as the seed. If any step fails, the entire seed (including bootstrap) is rolled back.

4. **Insert vs update:** Admin users, OIDC applications, SMTP connectors, and seed users are inserted as new records — running bootstrap twice (e.g. without `--swe`) will fail with a duplicate-key error. The Account Centre settings and MFA factors use `UPDATE` and will silently overwrite any existing values on repeat runs.

5. **Password security:** Passwords in environment variables and seed files are hashed with Argon2i (OWASP-recommended settings) before being stored. Plaintext passwords are never persisted.

6. **Client ID constraint:** The Logto database uses `varchar(21)` for application IDs. Ensure your `LOGTO_APP_CLIENT_ID` is 21 characters or fewer.
