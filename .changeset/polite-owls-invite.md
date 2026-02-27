---
"@logto/core": patch
---

ensure built-in Account center and Demo app automatically register custom-domain callback URLs as valid redirect URIs

- Issue: On custom-domain requests, Account center signs in with `redirect_uri` based on `window.location.origin` (for example `https://custom.example.com/account`), but built-in client metadata was generated from default tenant URLs only, so OIDC validation could reject it with `invalid_redirect_uri`. Demo app had the same gap.
- Fix: Updated `getTenantUrls` to accept an optional runtime endpoint and include it in the deduplicated tenant URL list. Then updated built-in metadata generation for both Account center and Demo app to pass `envSet.endpoint`, so redirect/logout URIs now include the active custom domain automatically.
