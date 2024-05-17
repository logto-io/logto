<p align="center">
  <a href="https://logto.io" target="_blank" align="center" alt="Logto Logo">
    <img src="./logo.png" height="120">
  </a>
</p>

[![discord](https://img.shields.io/discord/965845662535147551?color=5865f2&label=discord)](https://discord.gg/vRvwuwgpVX)
[![checks](https://img.shields.io/github/checks-status/logto-io/logto/master)](https://github.com/logto-io/logto/actions?query=branch%3Amaster)
[![release](https://img.shields.io/github/v/release/logto-io/logto?color=3a3c3f)](https://github.com/logto-io/logto/releases)
[![core coverage](https://img.shields.io/codecov/c/github/logto-io/logto?label=core%20coverage)](https://app.codecov.io/gh/logto-io/logto)
[![cloud](https://img.shields.io/badge/cloud-available-7958ff)](https://cloud.logto.io/?sign_up=true&utm_source=github&utm_medium=repo_logto)
[![gitpod](https://img.shields.io/badge/gitpod-available-f09439)](https://gitpod.io/#https://github.com/logto-io/demo)
[![render](https://img.shields.io/badge/render-deploy-5364e9)](https://render.com/deploy?repo=https://github.com/logto-io/logto)

Logto[^info] is an Auth0 alternative designed for modern apps and SaaS products. It offers a seamless developer experience and is well-suited for individuals and growing companies.

🧑‍💻 **Comprehensive frontend-to-backend identity solution**

- Enables OIDC-based authentication with Logto SDKs.
- Supports passwordless sign-in, along with various options like email, phone number, username, Google, Facebook, and other social sign-in methods.
- Offers beautiful UI components with customizable CSS to suit your business needs.

📦 **Out-of-the-box infrastructure**

- Includes a ready-to-use Management API, serving as your authentication provider, thus eliminating the need for extra implementation.
- Provides SDKs that seamlessly integrate your apps with Logto across multiple platforms and languages, tailored to your development environment.
- Offers flexible connectors that can be scaled with community contributions and customized with SAML, OAuth, and OIDC protocols.

💻 **Enterprise-ready solutions**

- Implements role-based access control (RBAC) for scalable role authorization, catering to a wide range of use cases.
- Facilitates user management and provides audit logs for understanding identity-related user information and maintaining security.
- Enables single sign-on (SSO) and multi-factor authentication (MFA) without extra coding.
- Leverages Logto Organizations to build multi-tenancy apps with ease.

In a more approachable way, we refer to this solution as "[Customer Identity Access Management (CIAM)](https://en.wikipedia.org/wiki/Customer_identity_access_management)" or simply, the "Customer Identity Solution."

[Subscribe to us](https://logto.io/subscribe/?utm_source=github&utm_medium=repo_logto) now to stay updated with the latest information about the Logto Cloud (SaaS) and receive feature updates in real-time.


## Get started

- Visit our 🎨 [website](https://logto.io/?utm_source=github&utm_medium=repo_logto) for a brief introduction if you are new to Logto.
- A step-by-step guide is available on 📖 [docs.logto.io](https://docs.logto.io/?utm_source=github&utm_medium=repo_logto).

### Interactive demo

- Try [Logto Cloud](https://cloud.logto.io/?sign_up=true&utm_source=github&utm_medium=repo_logto) to have the same dev experience and zero deployment overhead.

- If you launch Logto [via GitPod](https://gitpod.io/#https://github.com/logto-io/demo), please wait until you see the message like `App is running at https://3002-...gitpod.io` in the terminal, press Cmd (or Ctrl on Windows) and click the URL starts with `https://3002-` to continue your Logto journey.

### Launch Logto

#### Docker Compose

Docker Compose CLI usually comes with [Docker Desktop](https://www.docker.com/products/docker-desktop).

```bash
curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/docker-compose.yml | \
docker compose -p logto -f - up
```

#### npm-init

Requires [Node.js](https://nodejs.org/) `^20.9.0` + [PostgreSQL](https://postgresql.org/) `^14.0`.

```bash
npm init @logto
```

## Language support

```ts
const languages = ['Deutsch', 'English', 'Español', 'Français', 'Italiano', '日本語', '한국어', 'Polski', 'Português', 'Русский', 'Türkçe', '简体中文', '繁體中文'];
```

## Web compatibility

Logto uses the [default browserslist config](https://github.com/browserslist/browserslist#full-list) to compile frontend projects, which is:

```
> 0.5%, last 2 versions, Firefox ESR, not dead
```

## Bug report, feature request, feedback

- Our team takes security seriously, especially when it relates to identity. If you find any existing or potential security issues, please do not hesitate to email 🔒 [security@logto.io](mailto:security@logto.io).
- About other bug reports, feature requests, and feedback, you can:
  - Directly 🙋 [open an issue](https://github.com/logto-io/logto/issues/new) on GitHub;
  - 💬 [Join our Discord server](https://discord.gg/vRvwuwgpVX) to have a live chat.

## Licensing

[MPL-2.0](LICENSE).

## Contributing

We have a [contributing guideline](https://github.com/logto-io/logto/blob/master/.github/CONTRIBUTING.md) available. Feel free to contact us before coding.

## Resources

- [📖 Logto docs](https://docs.logto.io/?utm_source=github&utm_medium=repo_logto)
- [✍️ Blog](https://blog.logto.io/?utm_source=github&utm_medium=repo_logto)

<br/>

[^info]: Designed by Silverhand Inc.
