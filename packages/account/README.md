# Account Center

The Logto account center app that allows users to manage their account settings, profile, and security options.

## Development

```bash
pnpm dev
```

## Import Guidelines

This package uses path aliases for cleaner imports:

- `@ac/*` - Account center source files (`./src/*`)
- `@experience/*` - Experience package shared files

### Important: Experience Package Imports

When importing from the experience package, **only import from the `shared` folder**:

```typescript
// ✅ Correct - importing from shared folder
import Button from '@experience/shared/components/Button';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';

// ❌ Incorrect - importing from non-shared folders
import { validateIdentifierField } from '@experience/utils/form';
import useSendVerificationCode from '@experience/hooks/use-send-verification-code';
```

### Why This Restriction?

1. **Shared folder** (`@experience/shared/*`) contains components and utilities designed to be reused across packages
2. **Non-shared folders** may have dependencies, hooks, or context providers that are specific to the experience package's internal architecture
3. Importing non-shared code can cause:
   - Missing context providers
   - Circular dependencies
   - Build/runtime errors

### What To Do Instead

If you need functionality from `@experience/utils/*` or other non-shared locations:

1. **Use shared packages** - Check if `@logto/core-kit`, `@logto/schemas`, or `@logto/shared` has what you need
2. **Re-implement locally** - Simple utilities can be implemented in account-center
3. **Move to shared** - If the utility is truly reusable, consider moving it to `@experience/shared/`

### Available Shared Packages

- `@logto/core-kit` - Core utilities like `emailRegEx` for validation
- `@logto/schemas` - TypeScript types and schemas
- `@logto/phrases-experience` - i18n translations
- `@logto/shared/universal` - Universal utilities (browser + Node.js compatible)
