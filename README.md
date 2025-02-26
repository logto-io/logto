<p align="center">
  <a href="https://logto.io/?utm_source=github&utm_medium=readme" target="_blank" align="center" alt="Go to Logto website">
    <picture>
      <source width="200" media="(prefers-color-scheme: dark)" srcset="https://github.com/logto-io/.github/raw/master/profile/logto-logo-dark.svg">
      <source width="200" media="(prefers-color-scheme: light)" srcset="https://github.com/logto-io/.github/raw/master/profile/logto-logo-light.svg">
      <img width="200" src="https://github.com/logto-io/logto/raw/master/logo.png" alt="Logto logo">
    </picture>
  </a>
</p>

[![discord](https://img.shields.io/discord/965845662535147551?color=5865f2&label=discord)](https://discord.gg/vRvwuwgpVX)
[![checks](https://img.shields.io/github/checks-status/logto-io/logto/master)](https://github.com/logto-io/logto/actions?query=branch%3Amaster)
[![release](https://img.shields.io/github/v/release/logto-io/logto?color=3a3c3f)](https://github.com/logto-io/logto/releases)
[![core coverage](https://img.shields.io/codecov/c/github/logto-io/logto?label=core%20coverage)](https://app.codecov.io/gh/logto-io/logto)
[![cloud](https://img.shields.io/badge/cloud-available-7958ff)](https://cloud.logto.io/?sign_up=true&utm_source=github&utm_medium=repo_logto)
[![gitpod](https://img.shields.io/badge/gitpod-available-f09439)](https://gitpod.io/#https://github.com/logto-io/demo)
[![render](https://img.shields.io/badge/render-deploy-5364e9)](https://render.com/deploy?repo=https://github.com/logto-io/logto)

# Logto

Logto[^info] is an open-source identity and access management infrastructure for modern apps and SaaS products, supporting OIDC, OAuth 2.0 and SAML open standards for authentication and authorization.

## Key features

### 🧑‍💻 Comprehensive frontend-to-backend identity solutions

- Enables OpenID Connect (OIDC) based authentication and authorization with Logto SDKs.
- Supports passwordless sign-in, along with various options like email, phone number, username, Google, Facebook, and other social sign-in methods.
- Offers beautiful prebuilt UI with customizable options to suit your business needs.

### 📦 Out-of-the-box infrastructure

- Includes a ready-to-use [Management API](https://openapi.logto.io/) that allows you to build customized functionality on top of Logto.
- Provides various [official SDKs and guides](https://docs.logto.io/quick-starts) that help you integrate your apps with Logto across multiple platforms and languages.
- Offers flexible [social and message connectors](https://docs.logto.io/integrations) that can be used for one-click social sign-ins and customized with SAML, OAuth, and OIDC protocols.

### 💻 Enterprise-ready solutions

- Implements [role-based access control (RBAC)](https://docs.logto.io/authorization/role-based-access-control) for scalable authorization.
- [Organizations](https://docs.logto.io/organizations/understand-how-organizations-work) is the way to build [multi-tenancy](https://blog.logto.io/tenancy-models) apps with ease.
- Enables user management with [audit logs](https://docs.logto.io/developers/audit-logs) to track identity-related activities and maintain security.
- Provides [single sign-on (SSO)](https://docs.logto.io/end-user-flows/enterprise-sso) and [multi-factor authentication (MFA)](https://docs.logto.io/end-user-flows/mfa) without coding.

## Get started

### Logto Cloud

Try [Logto Cloud](https://cloud.logto.io/?sign_up=true&utm_source=github&utm_medium=repo_logto) to start the Logto journey with zero deployment overhead.

### GitPod

You can launch Logto [via GitPod](https://gitpod.io/#https://github.com/logto-io/demo). Please wait for the message `App is running at https://3002-...gitpod.io` to appear in the terminal, press Command on macOS or Ctrl on Windows, then click the URL starting with `https://3002-` to continue your Logto journey.

### Docker Compose

Docker Compose CLI usually comes with [Docker Desktop](https://www.docker.com/products/docker-desktop).

```bash
curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/docker-compose.yml | \
docker compose -p logto -f - up
```

### npm-init

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
  - Directly 🙋 [open an issue](https://github.com/logto-io/logto/issues/new) on GitHub if you find a bug.
  - 💬 [Join our Discord server](https://discord.gg/vRvwuwgpVX) to have a live chat.
  - 📧 [Subscribe to our newsletter](https://logto.io/subscribe) to stay tuned on our latest articles and updates.

## Licensing

[MPL-2.0](LICENSE).

## Contributing

We have a [contributing guideline](https://github.com/logto-io/logto/blob/master/.github/CONTRIBUTING.md) available. Feel free to reach out to us before coding.

## Resources

- [📚 Logto docs](https://docs.logto.io/?utm_source=github&utm_medium=repo_logto) for 
- [📝 Logto blog](https://blog.logto.io/?utm_source=github&utm_medium=repo_logto) for in-depth articles, tutorials, and updates.
- [🔗 Logto API](https://openapi.logto.io/?utm_source=github&utm_medium=repo_logto)
- Check out our [awesome list](./AWESOME.md) of community-contributed resources.

[^info]: Designed by Silverhand Inc.
