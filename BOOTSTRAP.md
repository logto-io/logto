# Logto Environment-Based Bootstrap

This guide explains how to configure Logto for **zero-click setup** in ephemeral or containerised environments. By setting environment variables before the first `db seed`, you can pre-configure an admin user, OIDC application, SMTP email connector, and seed user accounts — all without touching the Admin Console.

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

### Sign-In Experience Configuration

Control how the sign in experience is initially set up.

| Variable | Required | Description |
|---|---|---|
| `LOGTO_BOOTSTRAP_SIGNIN_EXPERIENCE` | No | If not set to `true`, the Sign In Experience will not be automatically configured |
| `LOGTO_SIGN_IN_IDENTIFIER` | No | Primary sign-in identifier: `email` or `username`. Defaults to `username` |

When set to `email`, the default tenant sign-in experience is configured for:

- **Sign-up**: Email + password with email verification
- **Sign-in**: Email + password (primary), with verification code fallback

> **Note:** SMTP must be independently configured (via `LOGTO_SMTP_*` variables or the Admin Console) for email-based sign-in to work. The bootstrap assumes SMTP is already set up.

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

      # Bootstrap: Sign-in identifier (email-primary)
      - LOGTO_SIGN_IN_IDENTIFIER=email
      - LOGTO_BOOTSTRAP_SIGNIN_EXPERIENCE=true

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

2. **Transactional:** All bootstrap operations run within the same database transaction as the seed. If any step fails, the entire seed (including bootstrap) is rolled back.

3. **No overwrite:** Bootstrap creates new records. It does not update existing applications, connectors, or users. To reconfigure, destroy and recreate the database.

4. **Password security:** Passwords in environment variables and seed files are hashed with Argon2i (OWASP-recommended settings) before being stored. Plaintext passwords are never persisted.

5. **Client ID constraint:** The Logto database uses `varchar(21)` for application IDs. Ensure your `LOGTO_APP_CLIENT_ID` is 21 characters or fewer.
