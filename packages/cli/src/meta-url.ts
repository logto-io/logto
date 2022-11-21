// Have to define this in a separate file since Jest sticks with CJS
// We need to mock this before running tests
// https://github.com/facebook/jest/issues/12952
export const metaUrl = import.meta.url;
