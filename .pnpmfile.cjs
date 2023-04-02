// See https://pnpm.io/pnpmfile
const fs = require('node:fs/promises');
const path = require('node:path');

// Types are inspected and edited from https://github.com/pnpm/pnpm/blob/ef6c22e129dc3d76998cee33647b70a66d1f36bf/hooks/pnpmfile/src/requireHooks.ts
/**
 * @typedef {Object} HookContext
 * @property {(message: string) => void} log
 */

/**
 * @typedef {Object} Hooks
 * @property {((pkg: unknown, context: HookContext) => unknown)=} readPackage
 */

const isObject = (value) => value !== null && typeof value === 'object';

/** @type Hooks */
const hooks = { readPackage: async (pkg) => {
  // Skip if not a connector package
  if (!(
    isObject(pkg) &&
    'name' in pkg &&
    String(pkg.name) !== '@logto/connector-kit' &&
    String(pkg.name).startsWith('@logto/connector-')
  )) {
    return pkg;
  }

  // Apply connector's `package.json` to the template
  const result = JSON.parse(
    // Use `__dirname` since the `pnpm i` command may be executed in nested workspace directories
    await fs.readFile(path.join(__dirname, 'packages/connectors/templates/package.json'), 'utf8')
  );
  for (const [key, value] of Object.entries(pkg)) {
    if (key === '$schema') {
      continue;
    }

    // Shallow merge
    if (Array.isArray(result[key])) {
      result[key] = [...result[key], ...value];
    } else if (typeof value === 'object' && value !== null) {
      result[key] = { ...result[key], ...value };
    } else {
      result[key] = value;
    }
  }

  return result;
} };

module.exports = {
  hooks,
};
