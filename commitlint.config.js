const { rules } = require('@commitlint/config-conventional');
const { execSync } = require('child_process');

// precomputed scope
const scopeComplete = execSync('git status --porcelain || true')
  .toString()
  .trim()
  .split('\n')
  .find((r) => ~r.indexOf('M  packages'))
  ?.replace(/(\/)/g, '%%')
  ?.match(/packages%%((\w|-)*)/)?.[1]
  ?.replace(/^connector(\w|-)*/g, 'connector');

/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [...rules['type-enum'][2], 'api', 'release']],
    'scope-enum': [2, 'always', ['connector', 'console', 'core', 'demo-app', 'test', 'phrases', 'schemas', 'shared', 'ui', 'deps']]
  },
  prompt: {
    typesAppend: [
      { value: 'api', name: 'api:      Api aspect modify' },
    ],
    customScopesAlign: !scopeComplete ? 'top' : 'bottom',
    defaultScope: scopeComplete,
    allowEmptyIssuePrefixs: false,
    allowCustomIssuePrefixs: false,
  }
};
