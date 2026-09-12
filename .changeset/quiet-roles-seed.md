---
"@logto/cli": patch
---

explain existing PostgreSQL tenant roles before database seeding stops

The database seed command now checks for the roles it needs before creating tables. If roles from a previous Logto database remain in the PostgreSQL cluster, the command reports the conflict and explains why dropping the database did not remove them, so an administrator can clean them up safely before retrying.
