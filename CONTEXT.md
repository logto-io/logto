# Custom JWT

Custom JWT lets a tenant add claims to tokens by running tenant-authored code during token issuance.

## Language

**Custom JWT**:
The product capability for adding tenant-defined claims to a token during issuance.
_Avoid_: Custom Claims feature, crypto framework

**Custom JWT script**:
Tenant-authored code whose `getCustomJwtClaims` entry point returns claims during token issuance.
_Avoid_: Custom Claims script, JWT hook

**Custom claims**:
The fields returned by a Custom JWT script for inclusion in a token.
_Avoid_: Custom JWT, default claims

**API context**:
The host-provided `api` object through which a Custom JWT script invokes a fixed set of privileged operations.
_Avoid_: Global API, runner unlock

**Cryptographic capability**:
The curated cryptographic operations exposed to a Custom JWT script through the API context.
_Avoid_: Web Crypto, unrestricted crypto

**Script sandbox**:
The isolated execution environment that restricts a Custom JWT script to explicitly provided data and capabilities.
_Avoid_: Local VM, unrestricted runtime

**Trusted-script model**:
The self-hosted execution model in which anyone allowed to edit a Custom JWT script is trusted with the same care as someone who can access the Logto server.
_Avoid_: Secure sandbox, untrusted tenant execution
