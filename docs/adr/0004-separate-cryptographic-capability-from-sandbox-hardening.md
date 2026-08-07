---
status: accepted
---

# Separate cryptographic capability from sandbox hardening

The initial cryptographic capability must not widen the host access already available to Custom JWT scripts, but it does not turn the self-hosted `node:vm` runner into a security sandbox. Cloud execution must continue isolating tenant scripts from the platform and other tenants, while self-hosted execution retains its trusted-script model; capability-only self-hosted isolation and network egress restrictions require a separate runner-hardening project.
