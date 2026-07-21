import {
  legacyActionFunctionName,
  unwrapActionScriptFromLegacyRunner,
  wrapActionScriptForLegacyRunner,
} from './action-script-compatibility.js';
import { runScriptFunctionInLocalVm } from './local-vm/index.js';

describe('action script compatibility', () => {
  it.each([
    ['new const', `const runAction = () => 'new const';`, 'new const'],
    ['new function', `function runAction() { return 'new function'; }`, 'new function'],
    ['new var', `var runAction = () => 'new var';`, 'new var'],
    ['legacy const', `const runInlineHook = () => 'legacy const';`, 'legacy const'],
    [
      'legacy function',
      `function runInlineHook() { return 'legacy function'; }`,
      'legacy function',
    ],
    ['legacy var', `var runInlineHook = () => 'legacy var';`, 'legacy var'],
  ])('exposes a %s entry point to the legacy runner', async (_name, script, expected) => {
    await expect(
      runScriptFunctionInLocalVm(
        wrapActionScriptForLegacyRunner(script),
        legacyActionFunctionName,
        {}
      )
    ).resolves.toBe(expected);
  });

  it('preserves top-level script semantics', async () => {
    const script = `
      var actionResult = 'visible on globalThis';
      const runAction = () => globalThis.actionResult;
    `;

    await expect(
      runScriptFunctionInLocalVm(
        wrapActionScriptForLegacyRunner(script),
        legacyActionFunctionName,
        {}
      )
    ).resolves.toBe('visible on globalThis');
  });

  it('prefers the new entry point when both names are declared', async () => {
    const script = `
      var runAction = () => 'new';
      var runInlineHook = () => 'legacy';
    `;

    await expect(
      runScriptFunctionInLocalVm(
        wrapActionScriptForLegacyRunner(script),
        legacyActionFunctionName,
        {}
      )
    ).resolves.toBe('new');
  });

  it('leaves scripts without an entry point invalid for the legacy runner', async () => {
    const script = `globalThis.sideEffect = true;`;

    await expect(
      runScriptFunctionInLocalVm(
        wrapActionScriptForLegacyRunner(script),
        legacyActionFunctionName,
        {}
      )
    ).rejects.toThrow(`The script does not have a function named \`${legacyActionFunctionName}\``);
  });

  it('wraps and unwraps scripts idempotently', () => {
    const script = `const runAction = () => ({ action: 'continue' });`;
    const wrapped = wrapActionScriptForLegacyRunner(script);

    expect(wrapActionScriptForLegacyRunner(wrapped)).toBe(wrapped);
    expect(unwrapActionScriptFromLegacyRunner(wrapped)).toBe(script);
    expect(unwrapActionScriptFromLegacyRunner(unwrapActionScriptFromLegacyRunner(wrapped))).toBe(
      script
    );
  });

  it.each([
    ['a trailing line comment', `const runAction = () => true;\n// keep this comment`],
    ['CRLF line endings', `const runAction = () => true;\r\n`],
    ['trailing whitespace', `const runAction = () => true;  \n\t`],
  ])('restores source with %s byte-for-byte', (_name, script) => {
    expect(unwrapActionScriptFromLegacyRunner(wrapActionScriptForLegacyRunner(script))).toBe(
      script
    );
  });

  it('does not unwrap old scripts or marker-like user content', () => {
    const oldScript = `const runInlineHook = () => 'legacy';`;
    const markerLikeScript = `/* LOGTO_ACTION_SCRIPT_COMPATIBILITY_V1 */\nconst value = true;`;

    expect(unwrapActionScriptFromLegacyRunner(oldScript)).toBe(oldScript);
    expect(unwrapActionScriptFromLegacyRunner(markerLikeScript)).toBe(markerLikeScript);
  });
});
