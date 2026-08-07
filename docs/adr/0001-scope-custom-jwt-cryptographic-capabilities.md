---
status: accepted
---

# Scope the initial cryptographic capability to self-hosted Custom JWT

Custom JWT scripts may receive built-in cryptographic capabilities, but Actions scripts do not receive them as part of this change. The initial capability exists only when development features are enabled in self-hosted Logto; Cloudflare Worker and Azure Function execution are out of scope and must not advertise or construct it. Before the capability can be exposed in Cloud or released beyond this development-only scope, every supported execution target must implement the same contract and pass the same conformance vectors.
