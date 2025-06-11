---
"@logto/core": minor
---

feat: add user interaction details to the custom token claims context

This update introduces a key feature that allows the storage of user interaction details in the `oidc_session_extensions` table for future reference.

Developers can now access user interaction data associated with the current token's authentication session through the context in the custom token claims script, enabling the creation of tailored token claims.

Key Changes:

- Store interaction details: User interaction details are now stored in the oidc_session_extensions table, providing a historical reference for the associated authentication session.
- Access user interaction details: In the custom token claims script, developers can retrieve user interaction details through the `context.interaction` property, allowing for the creation of dynamic and context-aware token claims. Logto will use the `sessionUid` to query the `oidc_session_extensions` table and retrieve the user interaction details.
- Interaction Context Includes:
  - `interactionEvent`: The event that triggered the interaction, such as `SignIn`, `Register`.
  - `userId`: The unique identifier of the user involved in the interaction.
  - `verificationRecords`: An array of verification records, providing details about the verification methods used for user identification and any MFA verification if enabled.

Example Use Case:
Developers can read the verification records from the interaction context. If an Enterprise SSO verification record is found, they can pass the user profile from the Enterprise SSO identities as additional token claims.

```ts
const ssoVerification = verifications.find(
  (record) => record.type === "EnterpriseSso"
);

if (ssoVerification) {
  return {
    enterpriseSsoIdentityId:
      enterpriseSsoVerification?.enterpriseSsoUserInfo?.id,
    familyName: enterpriseSsoVerification?.enterpriseSsoUserInfo?.familyName,
  };
}
```
