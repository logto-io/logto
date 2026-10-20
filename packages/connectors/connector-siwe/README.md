# Ethereum wallet connector (SIWE)

Sign in to Logto with an EVM-compatible browser wallet using [Sign-In with Ethereum (EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361).

Unlike OAuth social connectors, this connector does not redirect users to a third-party authorization page. The Logto Experience application asks the browser wallet to sign a one-time SIWE message, then submits the message and signature to the connector for verification.

## Supported

- **EVM chains only** (Ethereum, Polygon, BNB Smart Chain, Arbitrum, Base, OP Mainnet, Avalanche C-Chain, Linea, zkSync Era, and other EVM chains). The same wallet address works across chains.
- **Browser-injected EIP-1193 wallets.** Wallets are discovered with [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), with a fallback to `window.ethereum`.
- **Externally owned accounts (EOA)** in this release. EIP-1271 smart-contract wallet signatures are not supported yet.

## Not supported

- WalletConnect, MetaMask SDK, or other deep links. Users must have a wallet extension injected into the browser.
- Native mobile SDK webviews without an injected EIP-1193 provider.
- Account Center wallet linking or other non-sign-in wallet scenarios.

## Configuration

| Field | Description |
| --- | --- |
| `Statement` | Optional statement shown in the wallet signature request. Defaults to `Sign in to Logto`. Line breaks are collapsed into spaces. |
| `Allowed chain IDs` | Comma-separated EVM chain IDs users can sign in with. Defaults to `1, 137, 56, 42161, 8453, 10, 43114, 59144, 324`. |

The Experience application switches the wallet to the first allowed chain when the wallet is connected to a network outside the list. If the wallet cannot switch, the user sees an unsupported-network message.

## How it works

1. `POST /experience/verification/social/:connectorId/authorization-uri` creates a connector session containing a one-time nonce, the sign-in page domain and origin, the issuance/expiration timestamps, the allowed chain IDs, and the statement.
2. The connector returns a `siwe://` URI carrying those parameters. The Experience application parses it; it is never opened in a browser.
3. The application discovers wallets, connects the selected wallet, switches networks if necessary, builds an EIP-4361 message, and asks the wallet to sign it with `personal_sign`.
4. `POST /experience/verification/social/:connectorId/verify` submits `{ message, signature }`. The connector:
   - parses and validates the message format;
   - checks the version, domain, origin, nonce, issuance and expiration timestamps, statement, and allowed chain ID;
   - recovers the signer with `viem` and compares it to the address in the message;
   - normalizes the address to EIP-55 checksum format.
5. The checksummed address becomes `SocialUserInfo.id`, so it is stored as the social identity `userId`. The chain ID is stored in `rawData` only; it is not part of the identity, because the same EOA address is valid across EVM chains.

The connector session is consumed when it is read, so each nonce can be used for exactly one verification attempt. A failed verification requires starting the flow again.

## Security notes

- The nonce is generated server-side and stored in the connector session. It is removed from the session as soon as the verification request reads it.
- The redirect URI is caller-controlled, so Core checks its origin against the tenant endpoint and active custom domains before creating the connector session. `domain` and `uri` are derived from that validated origin.
- Messages expire after 10 minutes and are checked against the server-generated timestamps, not only the timestamps in the client-supplied message.
- Only chain IDs in the configured allow-list are accepted.
- Signatures are verified locally; no RPC endpoint is required for EOA verification.

## Development

```sh
pnpm --filter @logto/connector-siwe test
pnpm --filter @logto/connector-siwe build
```

To use the connector in a local Logto instance, build it and link it into the core connector directory:

```sh
pnpm --filter @logto/connector-siwe build
pnpm cli connector link
```
