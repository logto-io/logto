---
sidebar_position: 1
---

# Introduction

🤘 Logto helps you quickly focus on everything after signing in with the following components:

- All-platform user sign-in / sign-up experience with SDK support (SPA, iOS and Android)
- Passwordless (SMS / Email) support
- Out-of-box social sign in support (GitHub, Google, WeChat, Alipay, etc.)
- A web UI to control all above (Admin Console)
- Extendable multi-language support
- Easy deployment

Boringly, we call it "[customer identity access management](https://en.wikipedia.org/wiki/Customer_identity_access_management)" or "customer identity solution".

# Get Started

## Prerequisites

- NodeJS >= 16.0.0
- PostgreSQL >= 14.0.0

It's okay that your PostgreSQL instance is not in the same machine as NodeJS (e.g. containers + remote database environment).

## Run Logto

### Download Script

In your terminal:

```bash
node -e "$(printf "%s" "$(curl -fsSL https://raw.githubusercontent.com/logto-io/logto/master/install.js)")"
```

The script will download Logto and create a directory `logto` in the location you ran it.
