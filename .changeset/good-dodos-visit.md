---
"@logto/console": major
"@logto/core": major
"@logto/schemas": major
---

**Decouple users and admins**

## 💥 BREAKING CHANGES 💥

Logto was using a single port to serve both normal users and admins, as well as the web console. While we continuously maintain a high level of security, it’ll still be great to decouple these components into two separate parts to keep data isolated and provide a flexible infrastructure.

From this version, Logto now listens to two ports by default, one for normal users (`3001`), and one for admins (`3002`).

- Nothing changed for normal users. No adaption is needed.
- For admin users:
    - The default Admin Console URL has changed to `http://localhost:3002/console`.
    - To change the admin port, set the environment variable `ADMIN_PORT`. For instance, `ADMIN_PORT=3456`.
    - You can specify a custom endpoint for admins by setting the environment variable `ADMIN_ENDPOINT`. For example, `ADMIN_ENDPOINT=https://admin.your-domain.com`.
    - You can now completely disable admin endpoints by setting `ADMIN_DISABLE_LOCALHOST=1` and leaving `ADMIN_ENDPOINT` unset.
    - Admin Console and admin user data are not accessible via normal user endpoints, including `localhost` and `ENDPOINT` from the environment.
    - Admin Console no longer displays audit logs of admin users. However, these logs still exist in the database, and Logto still inserts admin user logs. There is just no convenient interface to inspect them.
    - Due to the data isolation, the numbers on the dashboard may slightly decrease (admins are excluded).

If you are upgrading from a previous version, simply run the database alteration command as usual, and we'll take care of the rest.

> **Note** DID YOU KNOW
>
> Under the hood, we use the powerful Postgres feature Row-Level Security to isolate admin and user data.
