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
- [Docker](https://www.docker.com/) and Docker Compose, if you want to run integration tests locally

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

## Run tests

### Unit tests

Most of the packages have their own unit tests and you can run them in the package directory with `pnpm test`. There's also a command `pnpm ci:test` in the project root to run all unit tests in the monorepo, which is usually used in CI.

### Integration tests

#### How integration tests run locally

For day-to-day development, you can run Logto directly on your host with `pnpm dev`, then execute the test cases in `packages/integration-tests` with `pnpm test`.

However, we recommend using the Docker-based setup for a more consistent environment. This keeps the backend environment closer to CI and avoids having to manually prepare Postgres, Redis, and other required environment variables before each run.

The local integration test uses Docker Compose to:

1. Start fresh Postgres and Redis containers.
2. Build a Logto Docker image from the current source tree.
3. Start Logto in Docker with integration test settings and seeded test data.
4. Run the integration test suite from the host machine.

> [!Note]
> Regular development is still easier with `pnpm dev`.

#### Run a test target

You can run the integration tests with the command below in the project root:

```bash
pnpm test:integration [target]
```

Where `<target>` is the name of the test target defined in [packages/integration-tests/package.json](../packages/integration-tests/package.json). For example, `pnpm test:integration experience` will run the experience-related test cases. By default, it runs API tests (equal to `pnpm test:integration api`).

Once tests are complete, the command will automatically stop the Docker containers, but the logs will be saved in `./logs` for debugging purposes.

#### Enable test coverage collection

To collect test coverage for the Logto backend during integration tests, set the environment variable `COVERAGE=1` when running the test command, like:

```bash
COVERAGE=1 pnpm test:integration api
```

Currently, only `api` and `well-known` test targets support coverage collection.

#### Notes

- The first run may take a while since it needs to build the Docker image and start the containers. Subsequent runs will be faster if there are no changes to your source code.
- If you only update the integration test code and don't want to build the Docker image again, you can set the environment variable `NO_BUILD=1` to skip the build step, like `NO_BUILD=1 pnpm test:integration api`.
- Some test helpers rely on shared files created by mock connectors. These files are written by the container and exposed to the host through a mounted directory. See `volumes` in [docker-compose.integration.yml](../docker-compose.integration.yml) for details.
- Some webhook-related tests start mock servers on the host machine. In those cases, the Logto container connects back to the host through a container-reachable hostname instead of `localhost`. See `extra_hosts` in [docker-compose.integration.yml](../docker-compose.integration.yml) for details.
- If an integration test fails, check the generated container logs first.

## Make changes

By default, Logto runs in `http://localhost:3001`, which will redirect you to the Admin Console.

`packages/console` holds the source code of Admin Console frontend (SPA). Start to make changes and see if the page reloads automatically.

**I updated some code, but it doesn't work.**

Please [report a bug](https://github.com/logto-io/logto/issues/new/choose) in issues.

## Commit and create pull request

We require every commit to [be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits), and both the commit message and pull request title follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

You can find repo-specific config in `commitlint.config.js`, if applicable.

If the pull request remains empty content, it'll be DIRECTLY CLOSED until it matches our contributing guideline.
