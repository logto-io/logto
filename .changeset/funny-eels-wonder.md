---
"@logto/translate": patch
---

allow empty file when syncing keys

The previous behavior was to throw an error if any of the `import` files was empty. This caused issues when we needed to remove files and resync keys, as it would lead to manual intervention to delete the `import` clauses.

With this change, missing or empty `import` files are treated as empty by default, allowing the sync process to continue without errors.
