interface ImportMeta {
  jest: typeof jest & {
    // Almost same as `jest.mock()`, but factory is required
    unstable_mockModule: <T = unknown>(
      moduleName: string,
      factory: () => T,
      options?: jest.MockOptions
    ) => typeof jest;
  };
}
