# User Migration to Logto

This document describes the process for setting up and running a user migration (specifically with passwords in `sha512crypt` format) into your local Logto instance.

## 1. Prerequisites

To run the project and migration scripts, you will need:

- **Node.js**: version `^22.14.0`
- **pnpm**: version `^9.0.0` or `^10.0.0`
- **PostgreSQL**: recommended version `17-alpine` (running in Docker)

## 2. Starting the Development Environment

### PostgreSQL
Start the database using Docker:
```bash
docker run -d --name logto-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=p0stgr3s -e POSTGRES_DB=logto postgres:17-alpine
```

### Logto Initialization
Set the database URL and initialize it:
```bash
export DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto"
pnpm cli db seed
pnpm cli connector link -p .
pnpm start:dev
```

## 3. Logto Console Configuration (M2M Application)

For the migration script to work, you must create a Machine-to-Machine (M2M) application that has access to the Management API:

1. Open Logto Console (usually at `http://localhost:5002`).
2. Go to **Applications**.
3. Click **Create Application** and select **Machine-to-Machine**.
4. Name it (e.g., "Migration Tool").
5. After creation, you will obtain the **App ID** and **App Secret**.
6. In the **API Access** tab, assign the application access to **Logto Management API** and select the required scopes (or "all").
7. The **API Indicator** for the Management API is typically `https://default.logto.app/api`.

## 4. Email Sign-in Setup

After migrating users who have an email address, it is often desirable to enable email sign-in instead of username sign-in. In Logto Console:

1. Go to **Sign-in & account** > **Sign-up and sign-in**.
2. In the **SIGN IN** section, select the email sign-in option.
3. **Important**: You must deactivate the **verification code** requirement so that users can sign in using only their password.
4. This feature is fully functional only if you have an **email connector** configured.

## 5. .env File Configuration

In the project root directory, create or edit the `.env` file and fill in the values obtained from the Console:

```env
DB_URL=postgresql://postgres:p0stgr3s@127.0.0.1:5432/logto
LOGTO_ENDPOINT=http://localhost:3001

APP_ID=your_m2m_app_id
APP_SECRET=your_m2m_app_secret
API_INDICATOR=https://default.logto.app/api
```

## 6. sha512crypt Support (Logto Core Modification)

If you are migrating users with passwords in `$6$rounds=...` format, you must have a modified Logto Core (see `migration/migration/MIGRATION_GUIDE.md` for details on patching `packages/core/src/utils/password.ts`).

Before running the migration, ensure Logto is built with these changes:
```bash
pnpm ci:build
```

## 7. Running the Migration

The migration script itself is located in the `migration/` directory. Before the first run, install the dependencies in this directory:

```bash
cd migration
npm install
```

Ensure the data file (e.g., `csvdata.csv`) is correctly placed and the path in `import.ts` corresponds to it. Then run the migration:

```bash
npm start
```

You can monitor the progress in the console. Any errors will be logged to `migration/errors.log`.
