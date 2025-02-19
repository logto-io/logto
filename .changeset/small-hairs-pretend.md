---
"@logto/connector-kit": minor
---

enhanced Handlebars template processing in the connector to support deep property access in email template variables.

## Updates

- Updated `replaceSendMessageHandlebars` logic to handle nested property paths in template variables
- Latest template processing logic now supports:
  - Direct replacement of primitive values (string/number/null/undefined)
  - Deep property access using dot-notation (e.g., `organization.branding.logoUrl`)
  - Graceful handling of missing properties (replaces with empty string)
  - Preservation of original handlebars when variables aren't provided in payload

## Examples

1. Direct replacement

```ts
replaceSendMessageKeysWithPayload("Your verification code is {{code}}", {
  code: "123456",
});
// 'Your verification code is 123456'
```

2. Deep property access

```ts
replaceSendMessageKeysWithPayload(
  "Your logo is {{organization.branding.logoUrl}}",
  { organization: { branding: { logoUrl: "https://example.com/logo.png" } } }
);
// 'Your logo is https://example.com/logo.png'
```

3. Missing properties

```ts
replaceSendMessageKeysWithPayload(
  "Your logo is {{organization.branding.logoUrl}}",
  { organization: { name: "foo" } }
);
// 'Your logo is '
```

4. Preservation of missing variables

```ts
replaceSendMessageKeysWithPayload(
  "Your application is {{application.name}}",
  {}
);
// 'Your application i {{application.name}}'
```
