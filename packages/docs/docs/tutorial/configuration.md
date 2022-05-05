---
sidebar_position: 2
---

# Configuration

## Usage

Logto handles environment variables with the following order:

- The `.env` file in the project root
- System environment variable

Thus if the system environment variable will override the value in `.env`.

## First-time Setup Questions {#questions}

For the first time you start Logto with no related environment variable, unless `--no-inquiry` is specified, it'll ask several questions for a smooth experience to fulfill the minimum requirements:

- If you'd like to generate a set of password peppers
- If you'd like to generate a private key for OIDC provider
- If you'd like to set up a new Logto database
- Enter the [Postgres DSN](https://www.postgresql.org/docs/14/libpq-connect.html#id-1.7.3.8.3.6)
- Finally the domain for Logto

Most of them are just simple yes / no questions or you can use the default value, except the [Postgres DSN](https://www.postgresql.org/docs/14/libpq-connect.html#id-1.7.3.8.3.6).

The generated private key for OIDC provider will locate on `./oidc-private-key.pem`, while other values will append to `./.env`.

:::note
The `--no-inquiry` parameter is appended by default in the Docker image.
:::

## Variable List

TBF in the next PR
