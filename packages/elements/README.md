# Logto elements

A collection of Web Components for building better applications with Logto.

> [!Warning]
> This package is still under development and not yet published to npm.

## Development

- The standard `dev` script is useful for testing the Logto integration when you are working with the workspace's `dev` script. How ever, the dev integration has some issues like duplicate registration and stale element cache. It's not easy to overcome them at the moment.
- Run the `start` script to start a quick development server that serves the elements via `index.html`.

## Internationalization

The elements are using `@lit/localize` for internationalization. The translations are stored in the `xliff` directory. There's no need to update that directory for new phrases, unless you can add the translations at the same time. See [Localization](https://lit.dev/docs/localization/overview/) for more information.

### Update translations

1. Run `lit-localize extract` to extract and sync the translations from the source code to the `xliff` directory.
2. Translate the phrases in the `xliff` directory.
3. Run `lit-localize build` to build the translations into the `src/generated` directory.

> [!Important]
> `lit-localize build` is required to build the bundle with the translations.

### Convention

Although `@lit/localize` gives us the flexibility to write localized strings in a casual way, we should follow a convention to keep the translations consistent.

When using `msg()`, a human-readable ID should be used, and it is highly recommended to also write the description to give the translators (or LLMs) more context.

```ts
// ✅ Good
msg('Not set', {
  id: 'general.fallback-title',
  desc: 'A fallback title when the title or heading of a component is not provided.',
})

// ❌ Bad
msg('Not set')
```
