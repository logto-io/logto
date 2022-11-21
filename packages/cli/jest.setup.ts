/**
 * Mocking `import.meta.url` and `got` here since they inevitably needs native ESM, but jest is sticking with CJS.
 * Will figure out a way to run tests in native ESM mode.
 */

jest.mock('./src/commands/database/alteration/meta-url.js', () => ({
  metaUrl: 'file:///',
}));

jest.mock('./src/meta-url.js', () => ({
  metaUrl: 'file:///',
}));

jest.mock('got', () => ({
  got: {},
}));

// Make lint-staged happy
export {};
