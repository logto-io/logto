---
"@logto/core": patch
"@logto/cli": patch
---

retry the database connection at startup when the host name cannot be resolved

Core now retries the database connection at startup when the host name cannot be resolved (`ENOTFOUND`, `EAI_AGAIN`), instead of exiting immediately. The CLI database commands (`db seed`, `db alteration deploy`…) now retry transient connection errors the same way core does, DNS failures included: they usually run right before `npm start` in the same container and used to exit on the first failed attempt.
