const path = require('node:path');

const swcJest = require('@swc/jest');

const experienceSrcPath = path.resolve(__dirname, '../experience/src').replaceAll('\\', '/');

const transformer = swcJest.createTransformer({
  sourceMaps: true,
  jsc: {
    transform: {
      react: {
        runtime: 'automatic',
      },
    },
  },
});

const rewriteExperienceAlias = (sourceText, sourcePath) => {
  const normalizedSourcePath = sourcePath.replaceAll('\\', '/');

  if (!normalizedSourcePath.startsWith(experienceSrcPath) || !sourceText.includes('@/')) {
    return sourceText;
  }

  return sourceText.replaceAll(/(["'])@\//g, '$1@experience/');
};

module.exports = {
  ...transformer,
  getCacheKey(sourceText, sourcePath, transformOptions) {
    return transformer.getCacheKey(
      rewriteExperienceAlias(sourceText, sourcePath),
      sourcePath,
      transformOptions
    );
  },
  process(sourceText, sourcePath, transformOptions) {
    return transformer.process(
      rewriteExperienceAlias(sourceText, sourcePath),
      sourcePath,
      transformOptions
    );
  },
};
