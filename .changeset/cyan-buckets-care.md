---
"@logto/core": patch
"@logto/phrases": patch
"@logto/schemas": patch
---

update SAML relay state length and improve error handling

The data type of the `relay_state` column in the `saml_application_sessions` table has been changed from varchar(256) to varchar(512) to accommodate longer Relay State values. For example, when Firebase acts as a Service Provider and initiates a SAML request, the relay state length is approximately 300-400 characters, which previously prevented Firebase from integrating with Logto as an SP before this fix.

Additionally, we have updated the error handling logic in the APIs related to the SAML authentication flow to make error messages more straightforward.
