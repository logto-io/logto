---
sidebar_position: 1
---

# Introduction

🤘 Logto helps you quickly focus on everything after signing in.

Main features:

- All-platform user sign-in / sign-up experience with SDK support (SPA, iOS and Android)
- Passwordless (SMS / Email) support
- Out-of-box social sign in support (GitHub, Google, WeChat, Alipay, etc.)
- A web UI to control all above (Admin Console)
- Extendable multi-language support
- Easy deployment

Boringly, we call it "[customer identity access management](https://en.wikipedia.org/wiki/Customer_identity_access_management)" (CIAM) or "customer identity solution."

## Get Started

### Prerequisites

- NodeJS >= 16.0.0
- PostgreSQL >= 14.0.0

We recommend using a new empty database which is dedicated for Logto, while it's not a hard requirement.

:::tip
It's okay that your PostgreSQL instance is not in the same machine as NodeJS (e.g. containers + remote database environment).
:::

### Run a Logto Instance

#### Download Script

In your terminal:

```bash
node -e "$(printf "%s" "$(curl -fsSL https://raw.githubusercontent.com/logto-io/logto/master/install.js)")"
```

The script will download Logto and create a directory `logto` in the location you ran it. After answering [several simple questions](./configuration#questions), you will see the message like:

```bash
Server is listening to port 3001
```

Heading to http://localhost:3001 to continue the Logto journey. Enjoy!

#### Docker

TBD

### Configuration

Logto uses environment variables for configuration, along with `.env` file support. See [Configuration](./configuration) for detailed usage and full variable list.
