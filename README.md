<p align="right">
  <a href="https://www.producthunt.com/posts/logto?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-logto" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=352638&theme=neutral" alt="Logto | Product Hunt" width="200" /></a>
</p>

<p align="center">
  <a href="https://logto.io" target="_blank" align="center" alt="Logto Logo">
    <img src="./logo.png" height="100">
  </a>
</p>

[![release](https://img.shields.io/github/v/release/logto-io/logto?color=7958FF)](https://github.com/logto-io/logto/releases)
[![core coverage](https://img.shields.io/codecov/c/github/logto-io/logto?label=core%20coverage)](https://app.codecov.io/gh/logto-io/logto)
[![checks](https://img.shields.io/github/checks-status/logto-io/logto/master)](https://github.com/logto-io/logto/actions?query=branch%3Amaster)
[![gitpod](https://img.shields.io/badge/gitpod-available-f09439)](https://gitpod.io/#https://github.com/logto-io/logto)
[![render](https://img.shields.io/badge/render-deploy-5364e9)](https://render.com/deploy?repo=https://github.com/logto-io/logto)

Logto[^info] helps you build the sign-in, auth, and user identity within minutes.

**Highlights**

- A frontend-to-backend identity solution.
  - A delightful sign-in experience for end-users and an OIDC-based identity service.
  - Web and native SDKs that can integrate your apps with Logto quickly.
- Out-of-box technology and UI support for many things you needed to code before.
  - A centralized place to customize the user interface and then LIVE PREVIEW the changes you make.
  - Social sign-in for multiple platforms (GitHub, Google, WeChat, Alipay, etc.).
  - Dynamic passcode sign-in (via SMS or email).
- Fully open-sourced, while no identity knowledge is required to use.
  - Super easy tryout (less than 1 min via GitPod, not joking), step-by-step tutorials and decent docs.
  - A full-function web admin console to manage the users, identities, and other things you need within a few clicks.

Boringly, we call it "[customer identity access management](https://en.wikipedia.org/wiki/Customer_identity_access_management)" (CIAM) or "customer identity solution."

## Get started

- Visit our 🎨 [website](https://logto.io) for a brief introduction if you are new to Logto.
- A step-by-step guide is available on 📖 [docs.logto.io](https://docs.logto.io) (also in [简体中文](https://docs.logto.io/zh-cn)).

### Launch Logto

#### Online demo (GitPod)

[Click here](https://gitpod.io/#https://github.com/logto-io/logto) to launch Logto via GitPod. Once you see the message like `App is running at https://3001-...gitpod.io` in the terminal, press Cmd (or Ctrl) and click the URL to continue your Logto journey.

#### Docker Compose

Docker Compose CLI usually comes with [Docker Desktop](https://www.docker.com/products/docker-desktop).

```bash
curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/docker-compose.yml | \
TAG=prerelease docker compose -p logto -f - up
```

#### One-liner script

Requires [Node.js](https://nodejs.org/) `^16.13.0` + [PostgreSQL](https://postgresql.org/) `^14.0`.

```bash
node -e "$(printf "%s" "$(curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/install.js)")"
```

## Language support

```ts
const languages = ['English', '简体中文', 'Türkçe', '한국어'];
```

## Bug report, feature request, feedback

- Our team takes security seriously, especially when it relates to identity. If you find any existing or potential security issues, please do not hesitate to email 🔒 [security@logto.io](mailto:security@logto.io).
- About other bug reports, feature requests, and feedback, you can directly 🙋 [open an issue](https://github.com/logto-io/logto/issues/new) on GitHub or 💬 [join our Discord server](https://discord.gg/UEPaF3j5e6) to have a live chat. We also have a 🗓️ [public roadmap](https://github.com/orgs/logto-io/projects/5) available.

## Contributing

We have a [contributing guideline](https://github.com/logto-io/logto/blob/master/.github/CONTRIBUTING.md) available. Feel free to contact us before coding.

<br/>

[^info]: Licensed with MPL-2.0. Designed by Silverhand Inc.
