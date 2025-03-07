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

Logto is the open-source auth alternative to Auth0, Cognito, and Firebase Auth. It offers a complete identity solution with pre-built UI, modern protocols for authentication and authorization (OIDC/OAuth 2.0/SAML), and enterprise-grade security. Perfect for multi-device apps, SaaS products, and API services.

<p align="center">
  <a href="https://logto.io/">Website</a> |
  <a href="https://cloud.logto.io/">Live demo</a> |
  <a href="https://docs.logto.io">Documentation</a> |
  <a href="https://openapi.logto.io/">API</a> |
  <a href="https://blog.logto.io/">Blog</a> |
  <a href="https://auth-wiki.logto.io/">Auth Wiki</a> |
  <a href="https://logto.io/subscribe">Newsletter</a>
</p>

![Logto features](./assets/logto-features.jpg)

## Why Logto?

Logto provides frontend-to-backend identity solutions for developers and enterprise with:

- **Logto Console**: A web-based interface for configuring and manage resources, offering a quick setup for sign-in experience and easy identity-management.
- **End-user experience**: Beautiful, out-of-the-box, complete authentication flows with full customization.
- **Logto APIs**: Logto’s backend offers a suit of APIs to facilitate various AuthN and AuthZ functionalities.
- **SDKs**: SDKs for 30+ frameworks, Machine-to-machine and CLI tools.
- **Enterprise-grade security**: MFA, SSO, RBAC, multi-tenancy isolation, and audit logs.

## Key features

| **Authentication** | **Authorization** | **Identity management** |
| --- | --- | --- |
| Email/SMS passwordless | API protection | Identity federation (Omni sign-in for multiple apps) |
| Social sign-in (OIDC/OAuth 2.0) | User role-based access control | Multi-tenancy management (Invitation/JIT/Org-level MFA) |
| Enterprise SSO (SAML/OIDC) | M2M role-based access control | User management (Profile/Invitation/Migration) |
| MFA (TOTP/Passkey/Backup) | Organization templates | User Impersonation |
| Personal access token | JWT / Opaque toke validation | Audit Logs |
| OAuth consent screen | Custom token claims | Webhooks |

**UI toolkit:** Prebuilt auth flows • Custom UI • Dark mode • i18n • Custom domain

[🗺️ View all features→](https://logto.io/pricing#compare-features)

## Get started in 60s

Start building with Logto in minutes:

- **GitPod:** [Launch Logto on GitPod](https://gitpod.io/#https://github.com/logto-io/demo). Wait for the message `App is running at https://3002-...gitpod.io` , then click the URL starting with `https://3002-` to continue.
- **Local development:**  
  ```bash
  # Using Docker Compose(requires Docker Desktop)
  curl -fsSL https://raw.githubusercontent.com/logto-io/logto/HEAD/docker-compose.yml | \
  docker compose -p logto -f - up
  
  # Using Node.js (requires PostgreSQL)
  npm init @logto
  ```
    
- **Logto Cloud:** No deployment required! Get started with [Logto Cloud](https://cloud.logto.io/?sign_up=true&utm_source=github&utm_medium=repo_logto).

[📚 Full installation guide →](https://docs.logto.io/logto-oss/get-started-with-oss)

## Integration ecosystem

Powered by industry-standard protocols (OIDC, OAuth, SAML), Logto empowers secure integration across your services, third-party platforms, and identity providers.

**Unlimited application integration:**

- **SDKs and guides**: Android, Angular, React, Next.js, Flutter, Go, Python, Vue, and 30+ more.
- **Custom integration**: Traditional web, SPAs, Native apps, M2M apps, OAuth third-party apps, and SAML apps.

[📚 Explore quick starts →](https://docs.logto.io/quick-starts)

**Universal identity provider (IdP) connection:** 

- **Social sign-in**: Google, Facebook, Apple, Microsoft, GitHub, Line, and more. Fully customizable via OIDC/OAuth 2.0.
- **Enterprise Single Sign-On**: Azure AD, Google Workspace, Okta, and more. Fully customizable via OIDC/SAML.

[📚 Explore all connectors →](https://docs.logto.io/integrations)

## Showcase

**Developer-friendly SDKs**: Install in minutes with step-by-step guides.

![Logto auth SDK showcase](./assets/showcase-logto-auth-sdks.gif)

**User-friendly auth flows**: Sign-up, sign-in, Social sign-in, Google one-tap, SSO, MFA, etc.

![Logto sign-in experience showcase](./assets/showcase-logto-sign-in-exeperience.gif)

**Multi-tenancy architecture**: organization RBAC, member invitations, just-in-time provision, etc.

![Logto multi-tenancy showcase](./assets/showcase-logto-multi-tenancy.gif)

## Support Logto

If you find Logto helpful, here's how you can support us:

- ⭐ **Star this repo** to show your support!
- 💬 [Join our Discord](https://discord.gg/vRvwuwgpVX) for live discussions.
- 📢 Share Logto on [Twitter](https://twitter.com/intent/tweet?text=Hey%20devs%21%20Need%20a%20better%20auth%20solution%3F%20Check%20out%20%40logto_io%20%E2%80%94%20it%E2%80%99s%20like%20Auth0%2FCognito%2FFirebase%20but%20open-source%2C%20modern%2C%20and%20way%20easier%20to%20use%21%20Supports%20OIDC%2C%20OAuth%202.0%2C%20SAML%2C%20and%20also%20works%20perfectly%20for%20SaaS%20apps.%20%E2%9C%A8%20https%3A%2F%2Flogto.io%20%23Auth%20%23Identity%20%23OpenSource%20%23DevTools), [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Flogto.io), [Reddit](https://reddit.com/submit?url=https%3A%2F%2Flogto.io&title=Tired%20of%20Auth0%2FCognito%2FFirebase%3F%20Logto%20is%20the%20open-source%20auth%20alternative%20you%E2%80%99ve%20been%20missing%21%20Supports%20OIDC%2C%20OAuth%202.0%2C%20SAML%2C%20and%20works%20like%20magic%20for%20modern%20apps%20and%20SaaS%20products.), [Telegram](https://t.me/share/url?url=https%3A%2F%2Flogto.io&text=Check%20out%20Logto%20%E2%80%94%20the%20better%20auth%20and%20identity%20infrastructure%21%20Open-source%2FCloud%20alternative%20to%20Auth0%2C%20Cognito%2C%20and%20Firebase.%20Supports%20all%20the%20standards%20%28OIDC%2C%20OAuth%2C%20SAML%29%20and%20is%20perfect%20for%20modern%20apps%20or%20SaaS%20products.%20https%3A%2F%2Flogto.io), [WhatsApp](https://api.whatsapp.com/send?text=Hey%21%20%F0%9F%91%8B%20Found%20this%20awesome%20auth%20tool%20called%20%2ALogto%2A%20%E2%80%94%20it%E2%80%99s%20open-source%2C%20way%20simpler%20than%20Auth0%2FCognito%2FFirebase%2C%20and%20supports%20OIDC%2FOAuth%2FSAML.%20Perfect%20for%20building%20CIAM%20system%20without%20the%20hassle.%20You%20gotta%20try%20it%3A%20https%3A%2F%2Flogto.io).
- 🏆 Write a review or tutorial on  [Dev.to](https://dev.to/logto), [Medium](https://medium.com/@logto), [G2](https://www.g2.com/products/logto/reviewer_verification) or your blog.
- 💬 [Share your use case](mailto:contact@logto.io?subject=[Share%20Logto%20User%20Story]) with us and get featured on the [Logto website](https://logto.io/).
- 🙋 [Open an issue](https://github.com/logto-io/logto/issues/new) to report bugs or suggest features.
- 💻 [Contribute to Logto](https://github.com/logto-io/logto/blob/master/.github/CONTRIBUTING.md) - we'd love your help! Check out [Logto awesome](https://github.com/logto-io/logto/blob/master/AWESOME.md) of community-contributed resources.

## Licensing

[MPL-2.0](LICENSE).

<p align="right">
⬆️ <a href="#logto">Back to top</a>
</p>
