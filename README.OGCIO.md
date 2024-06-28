[comment]: <> (This file has been added on OGCIO fork)

# LogTo per OGCIO

## Get started

If you want to run it locally, you just have to run
```
make build run
```

And, once the process ended, you're ready to open `http://localhost:3302` on your browser to navigate on your LogTo instance!

## Sync with main repository

To sync with the main repository, once a new version is released, follow the following steps:
- add the main repository remote, if it is not set in your git configuration, `git remote add upstream git@github.com:logto-io/logto.git`
- run `git fetch --tags upstream` to fetch all the tags from the main repository
- check if the tag you want to sync with exists `git tag -v YOUR_TAG`, e.g. `git tag -v v1.17.0`
- checkout a new branch, starting by `dev`, locally, naming it `feature/YOUR_TAG`, 
e.g. `git checkout dev && git pull && git checkout -b feature/v1.17.0`
- merge the main repository tag accepting incoming updates using `git merge YOUR_TAG --strategy-option theirs`, 
e.g. `git merge v1.17.0 --strategy-option theirs`
- given that across releases they do a lot of commits, you will probably have to resolve some conflicts, check what did you change since the last sync and fix them!
- run `pnpm run dev` from the root directory and check for errors. What I suggest to do is to open a GitHub page with the tag from the main repository you are syncing with, then one with the latest OGCIO `dev` branch and check for differences between them
- commit the changes with `git commit -a` to end the merge and let git write the correct message
- push and open your PR!

## Setup and run Logto natively

You can also run Logto natively on your machine outside the docker container.

### Prerequisites
- NodeJS v20.10.0
- PNPM v7.0

### Starting the database

If you start Logto natively, the database won't be available, and you will have to start it separately. The database is still dockerized and has its own Docker Compose configuration. Use the following command to start the database container:

`docker compose -f docker-compose-db.yml up -d`

With the following command, you can shut down the database container:

`docker compose -f docker-compose-db.yml down`

### Configuration and installation

To run Logto natively, you must install and configure it first. These steps must be performed only once.

1. Create a `.env` file in your Logto's codebase's root folder and place the following configuration into it:

```
# Default config
TRUST_PROXY_HEADER=1
DB_URL=postgresql://postgres:p0stgr3s@localhost:5433/logto
ADMIN_PORT=3302
PORT=3301

# OGCIO Config
USER_DEFAULT_ORGANIZATION_NAMES=OGCIO Seeded Org
USER_DEFAULT_ORGANIZATION_ROLE_NAMES=OGCIO Employee, OGCIO Manager
```

2. Install all the dependencies. Please also refer to the [original guide](.github/CONTRIBUTING.md) when building the project.

`pnpm pnpm:devPreinstall && pnpm i && pnpm prepack`

3. After the installation, you can start seeding the database. You have to seed in two steps:
- seed Logto's database: `pnpm cli db seed`
- seed custom OGCIO data: `npm run cli db ogcio -- --seeder-filepath="./packages/cli/src/commands/database/ogcio/ogcio-seeder-local.json"`

    3.5. Database alteration

    If you are upgrading your dev environment from an older version, or facing the `Found undeployed database alterations...` error when starting Logto, you need to deploy the database alteration first.

    Run `pnpm alteration deploy` and start Logto again. See [Database alteration](https://docs.logto.io/docs/tutorials/using-cli/database-alteration) for reference of this command.

    If you are developing something with database alterations, see [packages/schemas/alteration](https://github.com/logto-io/logto/tree/master/packages/schemas/alterations) to learn more.

4. After the seeding of the database was finished, the connectors must be built and linked to the system:

- `pnpm connectors build`

- `pnpm cli connector link`

### Starting Logto

The local Logto instance can be started by running the following command:

`pnpm dev`

After the system is up and running, you can access the admin interface by accessing `http://localhost:3302`

### First-time login

After installing and seeding the database, you must create a default admin user. This can be done by accessing the admin interface for the first time. After creating your admin user, you can access the admin dashboard. Every configuration needed for the OGCIO Building Blocks integration should be seeded already.

## Custom seeder

We made a custom seeder to ensure the required configuration for OGCIO Building Block integration exists right after the installation. The seeder also makes configuring the deployed Logto instance easy via a CI pipeline. The seeder is located in `packages/cli/src/commands/database/ogcio/`. The configuration for the local dev environment is inside `packages/cli/src/commands/database/ogcio/ogcio-seeder-local.json`.

Each type of configuration has its own dedicated file, which serves as a repository of knowledge about the structure of the configuration and how it should be inserted into the database. This approach ensures a systematic and organized management of the database configuration.

In `packages/cli/src/commands/database/ogcio/queries.ts`, we have included a set of helper functions that are essential for interacting with the database. These functions, designed to insert, update, and read data in a generic way, are written with a specific focus on preventing data duplication. This is a critical feature, as it ensures that the database remains intact and free from data duplication even if the seeder is executed multiple times.

The following command can execute the seeder:

`npm run cli db ogcio`

This command can take a parameter to specify the input data file, called `seeder-filepath`, which allows us to seed different data in different environments.

Usage: `npm run cli db ogcio -- --seeder-filepath="DATA_FILE_PATH"`

To seed the default data for local dev environments, run `npm run cli db ogcio -- --seeder-filepath="./packages/cli/src/commands/database/ogcio/ogcio-seeder-local.json"`.
