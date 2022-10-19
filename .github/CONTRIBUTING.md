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
> We've moved our connectors to an [independent repo](https://github.com/logto-io/connectors).

Before starting the work, join our [Discord channel](https://discord.gg/cyWnux4cH6) or [email us](mailto:contact@logto.io) to double-check if there's an ongoing project for your desired connector. We'll confirm with you your need and the status quo.

Since a new connector means a new Node.js package, we encourage you to separate your work into two Pull Requests:

1. The initial setup of the connector package, including `package.json`, base dependencies and scripts (build, lint, etc.), and the connector class skeleton (a class extends the base class, but no implementation).
2. The full connector implementation with unit tests.

### Core features

If you find some feature is related to customer identity and doesn't belong to a specific connector, then most likely, it's a core feature.

Since Logto is still in the early stage, it may already be in [our roadmap](https://silverhand.notion.site/Logto-Public-Roadmap-d6a1ad19039946b7b1139811aed82dcc). You can also join our [Discord channel](https://discord.gg/vRvwuwgpVX) or [email us](mailto:contact@logto.io) to get the details.

The concept of feature varies by the situation, so we'll work with you to figure out the best way to contribute before starting.

## Set up the dev environment

### Prerequisites

We use the monorepo approach for development. Since pnpm supports monorepo naturally, it's the package manager for Logto.

You'll need these installed to proceed:

- [Node.js](https://nodejs.org/) `^16.13.0`
- [pnpm](https://pnpm.io/) `^7.0`
- A [Postgres](https://postgresql.org/) `^14.0` instance

### Clone and install dependencies

Clone the repo https://github.com/logto-io/logto in the way you like, then execute the command below in the project root:

```bash
pnpm i
```

It may take a while to install dependencies.

### Set up database

Create a `.env` file with the following content in the project root, or set the environment variable directly:

```env
DB_URL=postgresql://your-postgres-dsn/logto # Replace with your own
```

Then run `pnpm cli db seed` to seed data into your database.

### Database alteration

If you are upgrading your dev environment from an older version, or facing the `Found undeployed database alterations...` error when starting Logto, you need to deploy the database alteration first.

Run `pnpm run alteration deploy` and start Logto again. See [Database alteration](https://docs.logto.io/docs/tutorials/using-cli/database-alteration) for reference.

### Add connectors (optional)

Run `pnpm cli connector add --official -p .` to add all Logto official connectors. See [Manage connectors](https://docs.logto.io/docs/tutorials/using-cli/manage-connectors) for details about managing connectors via CLI.

## Start dev

Run the command below in the project root:

```bash
pnpm dev
```

The command will watch the changes of most of the packages and restart services when needed.

## Make changes

By default, Logto runs in `http://localhost:3001`, which will redirect you to the Admin Console.

`packages/console` holds the source code of Admin Console frontend (SPA). Start to make changes and see if the page reloads automatically.

**I updated some code, but it doesn't work.**

Please [report a bug](https://github.com/logto-io/logto/issues/new/choose) in issues.

## Commit and create pull request

We require every commit to [be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits), and both the commit message and pull request title follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

You can find repo-specific config in `commitlint.config.js`, if applicable.

If the pull request remains empty content, it'll be DIRECTLY CLOSED until it matches our contributing guideline.
