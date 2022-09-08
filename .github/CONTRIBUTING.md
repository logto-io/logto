# (Draft) Contribute to Logto monorepo

Thanks for your interest in contributing to Logto. We respect the time of community contributors, so it'll be great if we can go through this guide which provides the necessary contribution information before starting your work.

**Table of contents**

- [(Draft) Contribute to Logto](#draft-contribute-to-logto)
  - [Contribution Type](#contribution-type)
    - [Bug fixes](#bug-fixes)
    - [Connectors](#connectors)
    - [Core features](#core-features)
  - [Set up the dev environment](#set-up-the-dev-environment)
    - [Prerequisites](#prerequisites)
    - [Clone and install dependencies](#clone-and-install-dependencies)
    - [Set up environment variables (optional)](#set-up-environment-variables-optional)
  - [Start dev](#start-dev)
    - [Note for a fresh setup](#note-for-a-fresh-setup)
  - [Make changes](#make-changes)

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

Since Logto is still in the early stage, it may already be in our roadmap. Until we have a publicly accessible place for the roadmap, join our [Discord channel](https://discord.gg/cyWnux4cH6) or [email us](mailto:contact@logto.io) to get the details.

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

### Set up environment variables (optional)

The root `npm start` is optimized for public release, which carries the `--from-root` parameter. In the dev environment, usually, we read `.env` from the package location instead.

- If you already have a `.env` in the project root, move it into `packages/core/` before continuing.
- If it's a fresh setup, no action is needed now. You can follow the command line questions afterward.

## Start dev

Run the command below in the project root:

```bash
pnpm dev
```

The command will do several things in order:

1. Compile `connectors`, `schemas`, and `phrases`.
2. Compile `core`, `ui`, `console`, and `demo-app`.
3. Watch the changes of the packages in step 2.

### Note for a fresh setup

If you start dev with no `.env` provided (a fresh setup), it'll have a great possibility that you'll miss the first question.

This is because `parcel` uses `ora` to show an in-line spinner which will overwrite the question, which asks if you'd like to generate a new cookie key.

Just press enter when you see the message like `✨ Built in 8.21s` to generate a new key by Logto.

## Make changes

By default, Logto runs in `http://localhost:3001`, which will redirect you to the Admin Console.

`packages/console` holds the source code of Admin Console frontend (SPA). Start to make changes and see if the page reloads automatically.

**I updated some code, but it doesn't work.**

Please [report a bug](https://github.com/logto-io/logto/issues/new/choose) in issues.

## Commit and create pull request

We require every commit to [be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits), and both the commit message and pull request title follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

You can find repo-specific config in `commitlint.config.js`, if applicable.

If the pull request remains empty content, it'll be DIRECTLY CLOSED until it matches our contributing guideline.
