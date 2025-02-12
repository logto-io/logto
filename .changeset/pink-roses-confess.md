---
"@logto/experience-legacy": patch
"@logto/experience": patch
---

properly filter WeChat connectors by platform (Web | Native) in SSR sign-in experience settings

Previously, platform-based social connector filtering was applied during the sign-in experience settings fetch process but not in the SSR sign-in experience data. As a result, platform-specific connectors were not correctly filtered when rendering the page using SSR data.

This update ensures that the same filtering logic is applied to SSR sign-in experience data, resolving the issue.

Affected connectors: WeChat Web and WeChat Native.
