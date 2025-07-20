# (Draft) Contribute to Logto monorepo

Thanks for your interest in contributing to Logto. We respect the time of community contributors, so it'll be great if we can go through this guide which provides the necessary contribution information before starting your work.

**Table of contents**

- [(Draft) Contribute to Logto monorepo](#draft-contribute-to-logto-monorepo)
  - [Contribution Type](#contribution-type)
    - [Bug fixes](#bug-fixes)
    - [Connectors](#connectors)
    - [Core features](#core-features)
  - [Set up the dev environment](#set-up-the-dev-environment)
    - [Prerequisites](#prerequisites)
    - [Clone and install dependencies](#clone-and-install-dependencies)
    - [Set up database](#set-up-database)
    - [Database alteration](#database-alteration)
    - [Add connectors (optional)](#add-connectors-optional)
  - [Start dev](#start-dev)
  - [Make changes](#make-changes)
  - [Commit and create pull request](#commit-and-create-pull-request)

## Contribution Type

### Bug fixes

We ensure Logto runs correctly with core unit tests, integration tests, and bug bash meetings. However, there's still a chance of missing or getting wrong on something.

If something doesn't work as expected, search in [Issues](https://github.com/logto-io/logto/issues) to see if someone has reported the issue.

- If an issue already exists, comment to say you're willing to take it.
- If not, create one before continuing. It'll be great to let other people know you found it and will fix it.

Usually, we'll confirm the details in the issue thread, and you can work on the Pull Request in the meantime.

> **Warning**
>
> Do not report a security issue directly in the public GitHub Issues, since someone may take advantage of it before the fix. Send an email to [security@logto.io](mailto:security@logto.io) instead.

### Connectors

Connector is the standard way in Logto to connect third-party services like SMS, email, and social identity providers. See [Connectors](https://docs.logto.io/docs/references/connectors/) if you don't know the concept yet.

> **Note**
>
> You can find all official connectors [here](https://github.com/logto-io/logto/tree/master/packages/connectors).

Before starting the work, join our [Discord channel](https://discord.gg/cyWnux4cH6) or [email us](mailto:contact@logto.io) to double-check if there's an ongoing project for your desired connector. We'll confirm with you your need and the status quo.

You can read this [documentation](https://docs.logto.io/docs/recipes/create-your-connector/) which describes how to implement and test a connector through concrete examples.

### Core features

If you find some feature is related to customer identity and doesn't belong to a specific connector, then most likely, it's a core feature.

Since Logto is still in the early stage, it may already be in [our roadmap](https://silverhand.notion.site/Logto-Public-Roadmap-d6a1ad19039946b7b1139811aed82dcc). You can also join our [Discord channel](https://discord.gg/vRvwuwgpVX) or [email us](mailto:contact@logto.io) to get the details.

The concept of feature varies by the situation, so we'll work with you to figure out the best way to contribute before starting.

## Set up the dev environment

### Prerequisites

We use the monorepo approach for development. Since pnpm supports monorepo naturally, it's the package manager for Logto.

You'll need these installed to proceed:

- [Node.js](https://nodejs.org/) `^18.12.0`
- [pnpm](https://pnpm.io/) `^9.0`
- A [Postgres](https://postgresql.org/) `^14.0` instance

### Clone and install dependencies

Clone the repo https://github.com/logto-io/logto in the way you like, then execute the command below in the project root:

```bash
pnpm i && pnpm prepack
```

`pnpm i` installs dependencies, which might take some time, and `pnpm prepack` builds the necessary workspace dependencies, enabling editors such as VSCode to locate their declarations.

### Set up database

Create a `.env` file with the following content in the project root, or set the environment variable directly:

```env
DB_URL=postgresql://your-postgres-dsn/logto # Replace with your own
```

Then run `pnpm cli db seed` to seed data into your database.

### Database alteration

If you are upgrading your dev environment from an older version, or facing the `Found undeployed database alterations...` error when starting Logto, you need to deploy the database alteration first.

Run `pnpm alteration deploy` and start Logto again. See [Database alteration](https://docs.logto.io/docs/tutorials/using-cli/database-alteration) for reference of this command.

If you are developing something with database alterations, see [packages/schemas/alteration](https://github.com/logto-io/logto/tree/master/packages/schemas/alterations) to learn more.

### Add connectors (optional)

Run `logto connector link -p .` to link all local connectors. You can also use `logto connector add <name> -p .` to install connector from NPM.

See [Manage connectors](https://docs.logto.io/docs/references/using-cli/manage-connectors) for details about managing connectors via CLI.

## Start dev

Run the command below in the project root:

```bash
pnpm dev
```

The command will watch the changes in most of the packages and restart services when needed.

## Running Integration Tests

The integration tests require special setup since they test the complete Logto system including authentication flows and database operations.

### Quick Start

1. **Reset test database** (creates fresh PostgreSQL container):
   ```bash
   cd packages/integration-tests
   ./reset-test-db.sh
   ```

2. **Link mock connectors** (from root directory):
   ```bash
   pnpm cli connector link --mock -p .
   ```

   Then add the required mock connectors:
   ```bash
   pnpm cli connector add @logto/connector-mock-social @logto/connector-mock-email @logto/connector-mock-sms -p .
   ```

3. **Set up mock Cloudflare configuration** (required for domain tests):
   ```bash
   DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto_test" pnpm cli db system set cloudflareHostnameProvider '{"zoneId":"mock-zone-id","apiToken":""}'
   ```

4. **Kill any existing processes on test ports**:
   ```bash
   lsof -ti:3001,3002,3003 | xargs kill -9 2>/dev/null || true
   ```

5. **Build in production mode** (from root directory):
   ```bash
   export NODE_ENV=production DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto_test" INTEGRATION_TEST=1 DEV_FEATURES_ENABLED=false SECRET_VAULT_KEK=DtPWS09unRXGuRScB60qXqCSsrjd22dUlXt/0oZgxSo=
   pnpm -r build
   ```

6. **Start production server** (from root directory):
   ```bash
   export NODE_ENV=production DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto_test" INTEGRATION_TEST=1 DEV_FEATURES_ENABLED=false SECRET_VAULT_KEK=DtPWS09unRXGuRScB60qXqCSsrjd22dUlXt/0oZgxSo=
   pnpm start
   ```

   Wait for the server to fully start - you should see. Then wait 10 seconds more or they're moody:
   - `core     info Core app is running at http://localhost:3001/`
   - `admin    info Admin app is running at http://localhost:3002/`

7. **Run tests** (in a new terminal):
   ```bash
   cd packages/integration-tests
   pnpm run test:api          # Run API tests only
   pnpm run test:experience   # Run experience tests only
   pnpm run test:console      # Run console tests only
   pnpm run test              # Run all integration tests
   ```

### Database Isolation

• **Complete isolation**: Each test run should use a fresh database for reliable results
• **Reset script**: Use `./reset-test-db.sh` to completely recreate PostgreSQL container
• **Clean state**: Script drops container, creates fresh one, and seeds with test data
• **Mock connectors**: Must be re-added after database reset
• **Cloudflare config**: Must be re-added after database reset

### Key Requirements

• **PostgreSQL container**: Docker container named `logto-postgres-dev` on port 5432
• **Integration test mode**: `INTEGRATION_TEST=1` enables development authentication headers
• **Test database**: Use `logto_test` database for isolation from development data
• **Mock connectors**: Required for testing social, email, and SMS functionality
• **Production mode**: Tests must run against production build (`NODE_ENV=production`)
• **Cloudflare mock**: Mock hostname provider configuration required for domain tests

### Environment Variables

The project includes a `.env.test` file with all required environment variables:

• `NODE_ENV=production`: Must run in production mode for tests to pass correctly
• `INTEGRATION_TEST=1`: Enables development authentication mode
• `DB_URL`: Test database connection string
• `DEV_FEATURES_ENABLED=false`: Disables development features for consistent testing
• `SECRET_VAULT_KEK`: Key encryption key for the secret vault (test-only value)
• `INTEGRATION_TESTS_LOGTO_URL`: Logto core URL (defaults to `http://localhost:3001`)
• `INTEGRATION_TESTS_LOGTO_CONSOLE_URL`: Console URL (defaults to `http://localhost:3002`)

### Troubleshooting

• **401 Unauthorized**: Missing `INTEGRATION_TEST=1` or database not seeded
• **Database errors**: Run `./reset-test-db.sh` to create fresh database
• **Connector errors**: Re-add mock connectors after database reset
• **Port conflicts**: Kill existing processes with `lsof -ti:3001,3002,3003 | xargs kill -9`
• **Test pollution**: Always reset database before running test suites
• **SPA proxy 404 errors**: Ensure you're running in production mode (`NODE_ENV=production`)
• **Connection refused**: Wait for server to fully start before running tests
• **Environment not loaded**: Export all environment variables before starting the server
• **Domain test failures**: Ensure mock Cloudflare config is set in database
• **Duplicate connector error**: Run `pnpm cli connector link --mock` before adding mock connectors

### Expected Test Results

With proper setup including all mock configurations, you should achieve:

• **Expected Success Rate**: ~98-100% of test suites should pass locally
• **Possible Failures**:
  - **Occasional timeouts**: Some tests may timeout on slower machines
  - **Race conditions**: Rare failures due to timing issues

The CI/CD pipeline uses the same configuration steps shown above. Following these instructions should give you the same results as CI/CD. If you're seeing failures after following all steps, the tests themselves may have issues that need investigation.

## Make changes

By default, Logto runs in `http://localhost:3001`, which will redirect you to the Admin Console.

`packages/console` holds the source code of Admin Console frontend (SPA). Start to make changes and see if the page reloads automatically.

**I updated some code, but it doesn't work.**

Please [report a bug](https://github.com/logto-io/logto/issues/new/choose) in issues.

## Commit and create pull request

We require every commit to [be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits), and both the commit message and pull request title follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

You can find repo-specific config in `commitlint.config.js`, if applicable.

If the pull request remains empty content, it'll be DIRECTLY CLOSED until it matches our contributing guideline.
