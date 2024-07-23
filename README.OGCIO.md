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

To help with conflict resolution you can leverage git rerere functionality (reuse recorded resolution). To enable it run `git config rerere.enabled true`. Enabling the rerere setting makes Git run for you `git rerere`, with no subcommand, at the appropriate times. When performing any merge, git will record the conflicting diff hunks and record, at commit time, how they were manually resolved. If there is already any previous recorded resolutions for those conflicts, git will use them to resolve the conflicts automatically. Additional [subcommands](https://git-scm.com/docs/git-rerere) are available and can help interacting with its working state.


## Run with Docker Compose
It is possible to run Logto, its database and our MyGovId mock service in a dockerized solution, with local or remote images.

### With local images
If you have the repository on your machine and want to use images built locally for both services you can run:
```
make build run
```

### With remote images
If you want to run Logto on your machine without cloning the repo, you need to have access to aws to pull our images as a prerequisite. If you haven't already, install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
If not yet configured, run
```
aws configure sso
```
After that, follow the prompts. You should be asked a name for the session (whatever helps you identify the session), the SSO start URL and the region. If you don't know what your SSO start URL is, you can find it on your AWS access portal. Click on your AWS account and then on the `Access keys` option. You can also find the region value in the same section.
For all other options, such as registration scopes, you can go with the default.

A script is available to login with AWS and Docker, create the custom network and run the containers. This is useful when launching it for the first time, or more in general when the image needs to be pulled.
The script expects an environment variable for the aws profile that you need to be logged in:
```
AWS_PROFILE=awsProfile-accountId
```

To execute the script, run:
```
[ ! -f docker-compose-ogcio-logto.yml ] && curl -fsSL https://raw.githubusercontent.com/ogcio/logto/HEAD/docker-compose-ogcio-logto.yml > /tmp/docker-compose-ogcio-logto.yml && curl -fsSL https://raw.githubusercontent.com/ogcio/logto/HEAD/run-logto-remote.sh | bash -s /tmp/docker-compose-ogcio-logto.yml
```
The command downloads the Docker Compose file from Github to a temporary location if it doesn't exist already, then fetches and executes the script from GitHub, passing the temporary Docker Compose file.

If you are already authenticated and just want to run the docker compose:

```
curl -fsSL https://raw.githubusercontent.com/ogcio/logto/HEAD/docker-compose-ogcio-logto.yml | docker compose -f - up -d
```

If you already have the repo cloned locally there is a Make command available:
```
make run-remote
```

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
MOCK_TOKEN_ENDPOINT=http://localhost:4005/logto/mock/token
MOCK_KEYS_ENDPOINT=http://localhost:4005/logto/mock/keys
```
2. Run the makefile command
```
make run-native
```

It runs, under the hood, all the following commands: 

1. Install all the dependencies. Please also refer to the [original guide](.github/CONTRIBUTING.md) when building the project.

`pnpm pnpm:devPreinstall && pnpm i && pnpm prepack`

2. After the installation, you can start seeding the database. You have to seed in two steps:
- seed Logto's database: `pnpm cli db seed`
- seed custom OGCIO data: `npm run cli db ogcio -- --seeder-filepath="./packages/cli/src/commands/database/ogcio/ogcio-seeder-local.json"`

    2.5. Database alteration

    If you are upgrading your dev environment from an older version, or facing the `Found undeployed database alterations...` error when starting Logto, you need to deploy the database alteration first.

    Run `pnpm alteration deploy` and start Logto again. See [Database alteration](https://docs.logto.io/docs/tutorials/using-cli/database-alteration) for reference of this command.

    If you are developing something with database alterations, see [packages/schemas/alteration](https://github.com/logto-io/logto/tree/master/packages/schemas/alterations) to learn more.

3. After the seeding of the database was finished, the connectors must be built and linked to the system:

- `pnpm connectors build`

- `pnpm cli connector link`

4. The local Logto instance can be started by running the following command:

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

### Limitations

In most cases, we have predefined IDs in our seeder to ensure the same database structure, even if the database was cleared and re-seeded. Logto IDs are simple text fields (no UUID or other validations are applied) with a maximum length of 21 characters. Do not use IDs longer than 21 characters; otherwise, the seeder will fail with a database error!

Be careful when defining a new ID because data duplication is avoided based on this field. If you later want to change the ID of any of your entries, the seeder won't be able to detect the existence of the affected entry, and it will try to create a new one. Creating a duplicate entry with a different ID can cause a database error if some other fields have a unique constraint. If this is not the case, a duplicate entry will be created, which is also a mistake, and we want to avoid any of these situations. Once you have defined an ID, do not change it if unnecessary.

Using resources other than those declared in the seeder's data file is also impossible because referencing any resource outside of the seeder's scope is not supported. The seeder is supposed to create all the required resources and use them to seed the custom configuration into the database.

### Edge cases

Some changes might affect other entries from the database, like the user entities. In this case, a custom migration script is required to resolve the changes necessary to the affected entries. Before any change in the seeder data, analyse the situation to determine if it is safe to perform. The seeder is not intended to resolve conflicts or update other data than the configuration it seeds.

Deletion of existing seeded data via the seeder is not yet possible. Only the permissions (scopes) will be removed and recreated every time the seeder is executed because that is safe and does not cause conflicts with other entries. A custom script or manual action is required for any other data that must be eliminated.
