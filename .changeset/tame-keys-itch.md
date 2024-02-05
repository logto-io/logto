---
"@logto/schemas": minor
---

Logto application schemas update to support the new third-party application feature (Logto as IdP).

- applications table alteration. Add new column `is_third_party` to indicate if the application is a third-party application.
- create new table `application_user_consent_resource_scopes` to store the enabled user consent resource scopes for the third-party application.
- create new table `application_user_consent_organization_scopes` to store the enabled user consent organization scopes for the third-party application.
- create new table `application_user_consent_user_scopes` to store the enabled user consent user scopes for the third-party application.
- create new table `application_user_consent_organizations` to store the user granted organizations for the third-party application.
- create new table `application_sign_in_experiences` to store the application level sign-in experiences for the third-party application.
