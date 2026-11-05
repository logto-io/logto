# @logto/connector-siwe

## 0.2.0

### Minor Changes

- 9d7d323: add Sign-In with Ethereum (SIWE / EIP-4361) for EVM wallets

  Administrators can enable an Ethereum Wallet social connector. Users with an injected EIP-1193 wallet can sign a one-time SIWE message without leaving the sign-in page. A single address works across supported EVM chains, and administrators can restrict the allowed chain IDs.

### Patch Changes

- d89e507: support Node.js 26

  Logto and the published packages now declare support for Node.js 22, 24 and 26. The minimum supported versions are 22.23.4, 24.22.1 and 26.12.1, which include the October 2026 Node.js security fixes.

- Updated dependencies [800eb13]
- Updated dependencies [d89e507]
- Updated dependencies [9d7d323]
- Updated dependencies [664e6ac]
- Updated dependencies [05678f9]
  - @logto/connector-kit@5.2.0
