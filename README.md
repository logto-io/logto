<p align="center">
  <a href="https://logto.io" target="_blank" align="center" alt="Logto Logo">
    <img src="./logo.png" height="100">
  </a>
</p>

---

<p align="center">
Logto is going to launch Cloud (Preview) and OSS General Availability on <a href="https://www.producthunt.com/products/logto" target="_blank">Product Hunt!</a><br/>
Click the “Notify me” button on the page in order to receive a notification when our launch is live.
</p>
<p align="center">
😊 See you on the cloud!
</p>

---

[![discord](https://img.shields.io/discord/965845662535147551?color=5865f2&label=discord)](https://discord.gg/vRvwuwgpVX)
[![checks](https://img.shields.io/github/checks-status/logto-io/logto/master)](https://github.com/logto-io/logto/actions?query=branch%3Amaster)
[![release](https://img.shields.io/github/v/release/logto-io/logto?color=7958FF)](https://github.com/logto-io/logto/releases)
[![core coverage](https://img.shields.io/codecov/c/github/logto-io/logto?label=core%20coverage)](https://app.codecov.io/gh/logto-io/logto)
[![gitpod](https://img.shields.io/badge/gitpod-available-f09439)](https://gitpod.io/#https://github.com/logto-io/demo)
[![render](https://img.shields.io/badge/render-deploy-5364e9)](https://render.com/deploy?repo=https://github.com/logto-io/logto)

Logto[^info] helps you build sign-in, auth, and user identity.

🧑‍💻 **A frontend-to-backend identity solution**

- A delightful sign-in experience for end-users and an OIDC-based identity service.
- Web and native SDKs that can integrate your apps with Logto quickly.

📦 **Out-of-box technology and UI support for many things you needed to code before**

- A centralized place to customize the user interface and then LIVE PREVIEW the changes you make.
- Social sign-in for multiple platforms (GitHub, Google, WeChat, Alipay, etc.).
- Dynamic passcode sign-in (via SMS or email).

💻 **Fully open-sourced, while no identity knowledge is required to use**

- Super easy tryout (less than 1 min via GitPod, not joking), step-by-step tutorials and decent docs.
- A full-function web admin console to manage the users, identities, and other things you need within a few clicks.

Boringly, we call it "[customer identity access management](https://en.wikipedia.org/wiki/Customer_identity_access_management)" (CIAM) or "customer identity solution."

[Subscribe to us](https://logto.io/subscribe) right away to receive up-to-date information about the Logto Cloud (SaaS) as well as in-time feature updates.

## Get started

- Visit our 🎨 [website](https://logto.io) for a brief introduction if you are new to Logto.
- A step-by-step guide is available on 📖 [docs.logto.io](https://docs.logto.io).

### Interactive demo

[![GitPod](https://raw.githubusercontent.com/gitpod-io/gitpod/30da76375c996109f243491b23e47feefab7217f/components/dashboard/public/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/logto-io/demo)

If you launch Logto via GitPod, please wait until you see the message like `App is running at https://3002-...gitpod.io` in the terminal, press Cmd (or Ctrl on Windows) and click the URL starts with `https://3002-` to continue your Logto journey.

### Launch Logto

#### Docker Compose

Docker Compose CLI usually comes with [Docker Desktop](https://www.docker.com/products/docker-desktop).

```bash
curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/docker-compose.yml | \
TAG=prerelease docker compose -p logto -f - up
```

#### npm-init

Requires [Node.js](https://nodejs.org/) `^18.12.0` + [PostgreSQL](https://postgresql.org/) `^14.0`.

```bash
npm init @logto
```

## Language support

```ts
const languages = ['Deutsch', 'English', 'Français', 'Português', '简体中文', 'Türkçe', '한국어'];
```

## Web compatibility

Logto uses the [default browserlist config](https://github.com/browserslist/browserslist#full-list) to compile frontend projects, which is:

```
> 0.5%, last 2 versions, Firefox ESR, not dead
```

## Bug report, feature request, feedback

- Our team takes security seriously, especially when it relates to identity. If you find any existing or potential security issues, please do not hesitate to email 🔒 [security@logto.io](mailto:security@logto.io).
- About other bug reports, feature requests, and feedback, you can:
  - Directly 🙋 [open an issue](https://github.com/logto-io/logto/issues/new) on GitHub;
  - 💬 [join our Discord server](https://discord.gg/vRvwuwgpVX) to have a live chat;
  - Engage in our 🗓️ [public roadmap](https://silverhand.notion.site/Logto-Public-Roadmap-d6a1ad19039946b7b1139811aed82dcc).

## Contributing

We have a [contributing guideline](https://github.com/logto-io/logto/blob/master/.github/CONTRIBUTING.md) available. Feel free to contact us before coding.

## Resources

- [📖 Logto docs](https://docs.logto.io?utm_source=github)
- [✍️ Silverhand blog](https://docs.logto.io/blog?utm_source=github)

<br/>

[^info]: Licensed with MPL-2.0. Designed by Silverhand Inc.
