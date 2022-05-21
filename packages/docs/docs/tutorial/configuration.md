---
sidebar_position: 2
---

# Configuration

## Usage

Logto handles environment variables in the following order:

- The `.env` file in the project root, which conforms with [dotenv](https://github.com/motdotla/dotenv#readme) format
- System environment variable

Thus the system environment variable will override the value in `.env`.

## First-time Setup Questions {#questions}

For the first time you start Logto with no related environment variable, unless `--no-inquiry` is specified, it'll ask several questions for a smooth experience to fulfill the minimum requirements:

- If you'd like to generate a cookie keys array for the OIDC provider
- If you'd like to generate a private key for the OIDC provider
- If you'd like to set up a new Logto database
- Enter the [Postgres DSN](https://www.postgresql.org/docs/14/libpq-connect.html#id-1.7.3.8.3.6)

Most of them are simple yes / no questions, or you can just go with the default value, except the [Postgres DSN](https://www.postgresql.org/docs/14/libpq-connect.html#id-1.7.3.8.3.6).

The generated private key for the OIDC provider will locate on `./oidc-private-key.pem`, while other values will append to `./.env`.

:::note
The `--no-inquiry` parameter is appended by default in the Docker image.
:::

## Variable List

### General

:::caution
If you run Logto via `npm start`, `NODE_ENV` will always be `production`.
:::

In default values, `protocol` will be either `http` or `https` according to your HTTPS config.

| Key                | Default Value                          | Type                                                     | Description                                                                                                  |
| ------------------ | -------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| NODE_ENV           | `undefined`                            | <code>'production' &#124; 'test' &#124; undefined</code> | What kind of environment that Logto runs in.                                                                 |
| PORT               | `3001`                                 | `number`                                                 | The local port that Logto listens.                                                                           |
| DB_URL             | N/A                                    | `string`                                                 | The [Postgres DSN](https://www.postgresql.org/docs/14/libpq-connect.html#id-1.7.3.8.3.6) for Logto database. |
| HTTPS_CERT_PATH    | `undefined`                            | <code>string &#124; undefined</code>                     | See [Enabling HTTPS](#enabling-https) for details.                                                           |
| HTTPS_KEY_PATH     | `undefined`                            | <code>string &#124; undefined</code>                     | Ditto.                                                                                                       |
| TRUST_PROXY_HEADER | `false`                                | `boolean`                                                | Ditto.                                                                                                       |
| ADMIN_CONSOLE_URL  | `'protocol://localhost:$PORT/console'` | `string`                                                 | The URL of Admin Console. This will affect Redirect URIs in Admin Console client metadata.                   |

### OIDC

| Key                   | Default Value                       | Type                                 | Description                                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OIDC_COOKIE_KEYS      | N/A                                 | <code>string[]</code>                | The string array of the [signing cookie keys](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys).                                                                                                                               |
| OIDC_PRIVATE_KEY      | N/A                                 | <code>string &#124; undefined</code> | The content of private key for [OIDC JWT signing](https://openid.net/specs/openid-connect-core-1_0.html#Signing). <br/> If you'd like to set this in `.env`, you can leverage [multiline values](https://github.com/motdotla/dotenv#multiline-values) support. |
| OIDC_PRIVATE_KEY_PATH | `'./oidc-private-key.pem'`          | <code>string &#124; undefined</code> | The path to the private key file for [OIDC JWT signing](https://openid.net/specs/openid-connect-core-1_0.html#Signing). <br/> Note Logto will *ignore* this value if `OIDC_PRIVATE_KEY` is not empty.                                                          |
| OIDC_ISSUER           | `'protocol://localhost:$PORT/oidc'` | `string`                             | The [issuer identifier](https://openid.net/specs/openid-connect-core-1_0.html#IssuerIdentifier) for OIDC. Usually it's the URL to your OIDC provider.                                                                                                          |

#### Supported Private Key Types

- RSA
- OKP (Ed25519, Ed448, X25519, X448 sub types)
- EC (P-256, secp256k1, P-384, and P-521 curves)

:::note
Logto mounts OIDC provider under path `/oidc`. That means if you mount Logto under `https://your.domain.com/logto`, the value of `OIDC_ISSUER` should be `https://your.domain.com/logto/oidc`.
:::

## Enabling HTTPS

### Using Node

Node natively supports HTTPS. Provide **BOTH** `HTTPS_CERT_PATH` and `HTTPS_KEY_PATH` to enable HTTPS via Node.

`HTTPS_CERT_PATH` implies the path to your HTTPS certificate, while `HTTPS_KEY_PATH` implies the path to your HTTPS key.

### Using a HTTPS Proxy

Another common practice is to have a HTTPS proxy in front of Node. 

In this case, you're likely want to set `TRUST_PROXY_HEADER` to `true` which indicates if proxy header fields should be trusted. Logto will pass the value to [Koa app settings](https://github.com/koajs/koa/blob/master/docs/api/index.md#settings).

See [Trusting TLS offloading proxies](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#trusting-tls-offloading-proxies) for when to configure this field.
