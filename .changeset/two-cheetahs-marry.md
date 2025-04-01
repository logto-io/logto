---
"@logto/core": patch
---

clean up legacy experience package

The migration to the new experience package is now complete, offering improved flexibility and maintainability through our Experience API. (see release [1.26.0](https://github.com/logto-io/logto/releases/tag/v1.26.0) for more details)

Key updates:

- Removed feature flags and migration-related logic
- Cleaned up transitional code used during gradual rollout
- Deprecated and removed `@logto/experience-legacy` package
- Fully adopted `@logto/experience` package with Experience API for all user interactions

This marks the completion of our authentication UI modernization, providing a more maintainable and extensible foundation for future enhancements.
