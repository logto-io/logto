<p align="center">
  <a href="https://logto.io" target="_blank" align="center" alt="Logto Logo">
    <img src="./logo.png" height="120">
  </a>
</p>

[![discord](https://img.shields.io/discord/965845662535147551?color=5865f2&label=discord)](https://discord.gg/vRvwuwgpVX)
[![checks](https://img.shields.io/github/checks-status/logto-io/logto/master)](https://github.com/logto-io/logto/actions?query=branch%3Amaster)
[![release](https://img.shields.io/github/v/release/logto-io/logto?color=3a3c3f)](https://github.com/logto-io/logto/releases)
[![core coverage](https://img.shields.io/codecov/c/github/logto-io/logto?label=core%20coverage)](https://app.codecov.io/gh/logto-io/logto)
[![cloud](https://img.shields.io/badge/cloud-available-7958ff)](https://cloud.logto.io/?sign_up=true)
[![gitpod](https://img.shields.io/badge/gitpod-available-f09439)](https://gitpod.io/#https://github.com/logto-io/demo)
[![render](https://img.shields.io/badge/render-deploy-5364e9)](https://render.com/deploy?repo=https://github.com/logto-io/logto)

Logto[^info] is a cost-effective open-source alternative to Auth0. It offers a seamless developer experience and is well-suited for individuals and growing companies.

🧑‍💻 **A frontend-to-backend identity solution**

- OIDC-based authentication and RBAC authorization.
- Passwordless sign in and much more diverse options, including Email, Phone number, Username, Google, Facebook and other social sign in methods.
- Beautiful UI components with customizable CSS to fit your business needs.

📦 **Out-of-box infrastructure**

- A ready-to-use management API can serve as your authentication provider, eliminating the need for extra implementation.
- SDKs that can integrate your apps with Logto quickly, multi-platform and language compatible, tailored to your development environment.
- Flexible connectors, scalable with community contributions, customizable with SMAL, OAuth, and OIDC protocols.

💻 **Enterprise-ready solutions**

- RBAC to control your resource through scalable role authorization for diverse use cases.
- User management and audit Logs to understand identity related user info and keep your security on track.
- We are currently working on SSO, Organizations and MFA! Stay tuned!

Boringly, we call it "[customer identity access management](https://en.wikipedia.org/wiki/Customer_identity_access_management)" (CIAM) or "customer identity solution."

[Subscribe to us](https://logto.io/subscribe) right away to receive up-to-date information about the Logto Cloud (SaaS) as well as in-time feature updates.

## Get started

- Visit our 🎨 [website](https://logto.io) for a brief introduction if you are new to Logto.
- A step-by-step guide is available on 📖 [docs.logto.io](https://docs.logto.io).

### Interactive demo

- Try [Logto Cloud](https://cloud.logto.io/?sign_up=true) to have the same dev experience and zero deployment overhead.

- If you launch Logto [via GitPod](https://gitpod.io/#https://github.com/logto-io/demo), please wait until you see the message like `App is running at https://3002-...gitpod.io` in the terminal, press Cmd (or Ctrl on Windows) and click the URL starts with `https://3002-` to continue your Logto journey.

### Launch Logto

#### Docker Compose

Docker Compose CLI usually comes with [Docker Desktop](https://www.docker.com/products/docker-desktop).

```bash
curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/docker-compose.yml | \
docker compose -p logto -f - up
```

#### npm-init

Requires [Node.js](https://nodejs.org/) `^18.12.0` + [PostgreSQL](https://postgresql.org/) `^14.0`.

```bash
npm init @logto
```

## Language support

```ts
const languages = ['Deutsch', 'English', 'Español', 'Français', '日本語', '한국어', 'Português', 'Русский', 'Türkçe', '简体中文', '繁體中文'];
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

## Licensing

See the [LICENSE](LICENSE) file for licensing information as it pertains to files in this repository.

## Contributing

We have a [contributing guideline](https://github.com/logto-io/logto/blob/master/.github/CONTRIBUTING.md) available. Feel free to contact us before coding.

## Resources

- [📖 Logto docs](https://docs.logto.io?utm_source=github)
- [✍️ Blog](https://docs.logto.io/blog?utm_source=github)

<br/>

[^info]: Designed by Silverhand Inc.
