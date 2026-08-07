---
status: accepted
---

# Expose curated cryptographic operations through the Custom JWT API context

Custom JWT exposes cryptographic operations as fixed methods on its existing `api` context instead of exposing Web Crypto, accepting dynamically selected algorithms, or introducing a general runner capability system. The first version supports only SHA-256 and HMAC-SHA-256; additional operations may be added individually when concrete use cases justify expanding the public contract. The host constructs a fixed, recursively frozen capability without accepting capability objects from tenant payloads, exposing native cryptographic objects, dynamically evaluating input, or recording key material. This narrow interface limits the privileged surface available to tenant-authored scripts without claiming to repair the existing self-hosted VM isolation model.
