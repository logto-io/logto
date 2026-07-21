const actionFunctionName = 'runAction';

export const legacyActionFunctionName = 'runInlineHook';

// This exact, versioned suffix is persisted in `logto_configs`. Keep it stable so newer versions
// can remove only the compatibility code they added without changing existing user scripts.
const legacyActionScriptCompatibilitySuffix = `
;/* LOGTO_ACTION_SCRIPT_COMPATIBILITY_V1 */
globalThis.${legacyActionFunctionName} =
  typeof ${actionFunctionName} === 'function'
    ? ${actionFunctionName}
    : typeof ${legacyActionFunctionName} === 'function'
      ? ${legacyActionFunctionName}
      : undefined;`;

/**
 * Append a legacy global entry point without scoping or otherwise changing the user's source.
 * The exact suffix check makes this safe to call at both persistence and execution boundaries.
 */
export const wrapActionScriptForLegacyRunner = (script: string) =>
  script.endsWith(legacyActionScriptCompatibilitySuffix)
    ? script
    : `${script}${legacyActionScriptCompatibilitySuffix}`;

/** Remove only the exact compatibility suffix written by {@link wrapActionScriptForLegacyRunner}. */
export const unwrapActionScriptFromLegacyRunner = (script: string) =>
  script.endsWith(legacyActionScriptCompatibilitySuffix)
    ? script.slice(0, -legacyActionScriptCompatibilitySuffix.length)
    : script;
