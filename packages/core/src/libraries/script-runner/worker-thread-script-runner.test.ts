import { readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import path from 'node:path';

import { packageDirectory } from 'pkg-dir';

import { type ScriptEntry, type ScriptRunInput } from './types.js';
import { WorkerThreadScriptRunner } from './worker-thread-script-runner.js';

const buildInput = (
  script: string,
  entry: ScriptEntry = 'runAction',
  payload: Record<string, unknown> = {}
): ScriptRunInput => ({
  script,
  entry,
  payload,
  limits: { wallClockMs: 2000, memoryMb: 64 },
  egress: { mode: 'allowAll' },
});

describe('WorkerThreadScriptRunner', () => {
  const runner = new WorkerThreadScriptRunner();

  // Every worker must be torn down: there is no `forceExit` or `globalTeardown` in this package, so
  // a surviving thread would hang the run.
  afterAll(async () => {
    await runner.dispose();
  });

  it('resolves the value an action script returns', async () => {
    await expect(
      runner.run(
        buildInput(
          `const runAction = ({ event, environmentVariables }) => ({
             name: event.user.name + environmentVariables.SUFFIX,
           });`,
          'runAction',
          { event: { user: { name: 'Foo' } }, environmentVariables: { SUFFIX: ' updated' } }
        )
      )
    ).resolves.toEqual({ ok: true, value: { name: 'Foo updated' } });
  });

  it('resolves the value a custom JWT script returns', async () => {
    await expect(
      runner.run(
        buildInput(
          'const getCustomJwtClaims = ({ token }) => ({ sub: token.sub });',
          'getCustomJwtClaims',
          { token: { sub: 'user-id' } }
        )
      )
    ).resolves.toEqual({ ok: true, value: { sub: 'user-id' } });
  });

  it('awaits a promise the script returns', async () => {
    await expect(
      runner.run(
        buildInput(
          `const runAction = async () => {
             await new Promise((resolve) => setTimeout(resolve, 10));
             return { done: true };
           };`
        )
      )
    ).resolves.toEqual({ ok: true, value: { done: true } });
  });

  it('preserves keys whose value is undefined', async () => {
    await expect(
      runner.run(
        buildInput(
          "const runAction = (payload) => ({ hasContext: 'context' in payload });",
          'runAction',
          {
            context: undefined,
          }
        )
      )
    ).resolves.toEqual({ ok: true, value: { hasContext: true } });
  });

  describe('the api context', () => {
    it('reports denied with the message the script passed', async () => {
      await expect(
        runner.run(
          buildInput(
            "const getCustomJwtClaims = ({ api }) => api.denyAccess('nope');",
            'getCustomJwtClaims'
          )
        )
      ).resolves.toEqual({ ok: false, kind: 'denied', message: 'nope' });
    });

    it('reports denied with the default message', async () => {
      await expect(
        runner.run(
          buildInput(
            'const getCustomJwtClaims = ({ api }) => api.denyAccess();',
            'getCustomJwtClaims'
          )
        )
      ).resolves.toEqual({ ok: false, kind: 'denied', message: 'Access denied' });
    });

    // Actions scripts have never received an `api`, and `action.test.ts` asserts as much. Handing
    // them one here would be a silent capability change.
    it('does not expose the api to action scripts', async () => {
      await expect(
        runner.run(buildInput('const runAction = ({ api }) => ({ apiType: typeof api });'))
      ).resolves.toEqual({ ok: true, value: { apiType: 'undefined' } });
    });

    // Custom JWT cryptographic capability
    it('exposes frozen sha256 and hmacSha256 on api.crypto for Custom JWT scripts', async () => {
      await expect(
        runner.run(
          buildInput(
            `const getCustomJwtClaims = async ({ api }) => ({
               digest: await api.crypto.sha256('abc'),
               hmac: await api.crypto.hmacSha256({ key: 'Jefe', input: 'what do ya want for nothing?' }),
               apiFrozen: Object.isFrozen(api),
               cryptoFrozen: Object.isFrozen(api.crypto),
             });`,
            'getCustomJwtClaims'
          )
        )
      ).resolves.toEqual({
        ok: true,
        value: {
          digest: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
          hmac: '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
          apiFrozen: true,
          cryptoFrozen: true,
        },
      });
    });

    it('does not expose api.crypto to action scripts', async () => {
      await expect(
        runner.run(
          buildInput(
            'const runAction = (payload) => ({ hasCrypto: Boolean(payload.api?.crypto) });'
          )
        )
      ).resolves.toEqual({ ok: true, value: { hasCrypto: false } });
    });

    // The sentinel class is private to the worker module, so a script can imitate its name but
    // never its identity — the `instanceof` check must not be fooled into a 403.
    it('does not mistake a script-thrown error named like the deny sentinel for a denial', async () => {
      await expect(
        runner.run(
          buildInput(
            `const getCustomJwtClaims = () => {
               const error = new Error('forged');
               error.name = 'DenyAccessSignal';
               throw error;
             };`,
            'getCustomJwtClaims'
          )
        )
      ).resolves.toMatchObject({
        ok: false,
        kind: 'runtime',
        name: 'DenyAccessSignal',
        message: 'forged',
      });
    });

    it('keeps serving on the same worker after a denial', async () => {
      const isolated = new WorkerThreadScriptRunner();
      const script = `var count = 0;
         const getCustomJwtClaims = ({ api, deny }) => {
           count += 1;
           if (deny) { api.denyAccess('no'); }
           return { count };
         };`;

      try {
        await expect(
          isolated.run(buildInput(script, 'getCustomJwtClaims', { deny: true }))
        ).resolves.toEqual({ ok: false, kind: 'denied', message: 'no' });
        // A denial is a settled outcome rather than a fault, so the worker stays pooled and its
        // state proves the second run reused it.
        await expect(
          isolated.run(buildInput(script, 'getCustomJwtClaims', { deny: false }))
        ).resolves.toEqual({ ok: true, value: { count: 2 } });
        expect(isolated.size).toBe(1);
      } finally {
        await isolated.dispose();
      }
    });
  });

  describe('failure kinds', () => {
    it('reports syntax for a script that cannot be compiled', async () => {
      const result = await runner.run(buildInput('const runAction = () => {'));

      // The compiler's message survives the flattening that carries it across the thread.
      expect(result).toMatchObject({
        ok: false,
        kind: 'syntax',
        message: expect.stringContaining('Unexpected end of input') as string,
      });
    });

    // The protocol promises that a script which cannot start never occupies a pool slot, so a
    // tenant retrying a broken script cannot pin the pool full of corpses.
    it('keeps a startup-failed worker out of the pool', async () => {
      const isolated = new WorkerThreadScriptRunner();

      try {
        await expect(isolated.run(buildInput('const runAction = () => {'))).resolves.toMatchObject({
          ok: false,
          kind: 'syntax',
        });
        expect(isolated.size).toBe(0);

        await expect(
          isolated.run(buildInput('const somethingElse = () => ({});'))
        ).resolves.toMatchObject({ ok: false, kind: 'type' });
        expect(isolated.size).toBe(0);
      } finally {
        await isolated.dispose();
      }
    });

    it('reports type when the entry function is missing', async () => {
      await expect(runner.run(buildInput('const somethingElse = () => ({});'))).resolves.toEqual({
        ok: false,
        kind: 'type',
        message: 'The script does not have a function named `runAction`',
      });
    });

    it('reports type when the entry name is not a function', async () => {
      await expect(runner.run(buildInput('const runAction = 1;'))).resolves.toEqual({
        ok: false,
        kind: 'type',
        message: 'The script does not have a function named `runAction`',
      });
    });

    // Structured clone degrades an Error subclass to `name: 'Error'` and drops its own properties,
    // so the worker must flatten the throw to plain strings before posting it.
    it('reports runtime with the name of the error class the script threw', async () => {
      const result = await runner.run(
        buildInput(
          `class ScriptSpecificError extends Error {
             constructor() { super('boom'); this.name = 'ScriptSpecificError'; }
           }
           const runAction = () => { throw new ScriptSpecificError(); };`
        )
      );

      expect(result).toMatchObject({
        ok: false,
        kind: 'runtime',
        name: 'ScriptSpecificError',
        message: 'boom',
      });
    });

    it('reports runtime for a value that is not an error', async () => {
      await expect(
        runner.run(buildInput("const runAction = () => { throw 'boom'; };"))
      ).resolves.toEqual({ ok: false, kind: 'runtime', name: 'Error', message: 'boom' });
    });

    // `String()` throws on a null-prototype object. Describing the throw happens inside the
    // worker's own catch, so failing there would escape as an unhandled rejection and take the
    // thread — and every run sharing it — down.
    it('reports runtime for a thrown value that cannot be converted to a string', async () => {
      const runner = new WorkerThreadScriptRunner();
      const script = `const runAction = ({ nasty }) => {
           if (nasty) { throw Object.create(null); }
           return new Promise((resolve) => { setTimeout(() => resolve({ innocent: true }), 200); });
         };`;

      try {
        const [innocent, nasty] = await Promise.all([
          runner.run(buildInput(script, 'runAction', { nasty: false })),
          runner.run(buildInput(script, 'runAction', { nasty: true })),
        ]);

        // The concurrent run keeps its own result rather than inheriting the failure.
        expect(innocent).toEqual({ ok: true, value: { innocent: true } });
        expect(nasty).toMatchObject({ ok: false, kind: 'runtime' });
        expect(runner.size).toBe(1);
      } finally {
        await runner.dispose();
      }
    }, 10_000);

    // `name`, `message` and `stack` are script-controlled getters, so reading them is a throw site
    // too. The counter proves the thread survived it rather than being respawned.
    it('reports runtime when the thrown error describes itself by throwing', async () => {
      const isolated = new WorkerThreadScriptRunner();
      const script = `var count = 0;
           const runAction = ({ nasty }) => {
             count += 1;
             if (nasty) {
               const error = new Error('outer');
               Object.defineProperty(error, 'name', { get() { throw new Error('inner'); } });
               throw error;
             }
             return { count };
           };`;

      try {
        await expect(
          isolated.run(buildInput(script, 'runAction', { nasty: true }))
        ).resolves.toMatchObject({ ok: false, kind: 'runtime' });
        await expect(
          isolated.run(buildInput(script, 'runAction', { nasty: false }))
        ).resolves.toEqual({ ok: true, value: { count: 2 } });
        expect(isolated.size).toBe(1);
      } finally {
        await isolated.dispose();
      }
    });

    it('reports runtime for a rejected promise', async () => {
      const result = await runner.run(
        buildInput("const runAction = async () => { throw new TypeError('bad'); };")
      );

      expect(result).toMatchObject({
        ok: false,
        kind: 'runtime',
        name: 'TypeError',
        message: 'bad',
      });
    });

    it('reports runtime when the script throws while being evaluated', async () => {
      const result = await runner.run(
        buildInput("throw new Error('top level'); const runAction = () => ({});")
      );

      expect(result).toMatchObject({ ok: false, kind: 'runtime', message: 'top level' });
    });

    it('reports type when the script returns a value the thread cannot transfer', async () => {
      const script = 'const runAction = () => () => 1;';
      const result = await runner.run(buildInput(script));

      // The `DataCloneError` is deliberately flattened to this constant, author-facing message.
      expect(result).toEqual({
        ok: false,
        kind: 'type',
        message: 'The script return value must be JSON-serializable.',
      });

      // Nothing was terminated, so the worker keeps serving.
      await expect(
        runner.run(buildInput('const runAction = () => ({ ok: true });'))
      ).resolves.toEqual({ ok: true, value: { ok: true } });
    });

    it('reports type when the payload cannot be transferred and keeps the worker healthy', async () => {
      const script = 'const runAction = () => ({ count: 1 });';
      const result = await runner.run(
        buildInput(script, 'runAction', { callback: () => 'not cloneable' })
      );

      expect(result).toMatchObject({
        ok: false,
        kind: 'type',
        message: expect.stringContaining('cannot be transferred to the worker thread') as string,
      });
      await expect(runner.run(buildInput(script))).resolves.toEqual({
        ok: true,
        value: { count: 1 },
      });
    });
  });

  it('rejects an egress policy it cannot enforce without spawning a worker', async () => {
    const isolated = new WorkerThreadScriptRunner();

    await expect(
      isolated.run({ ...buildInput('const runAction = () => ({});'), egress: { mode: 'denyAll' } })
    ).rejects.toThrow(/denyAll/);
    expect(isolated.size).toBe(0);

    await isolated.dispose();
  });

  // The worker entry is bundled on its own in the production build, so an app import would pull
  // whole subsystems and their top-level side effects into every script worker.
  //
  // The `node:` prefix is deliberately stripped before the check: the type-check build keeps it and
  // the bundled build drops it, and asserting on the prefix would only ever describe the build Jest
  // happens to be looking at.
  //
  // The Custom JWT cryptographic capability helper is the only allowed relative import: it uses
  // Node builtins exclusively, the type-check build leaves the specifier, and the production
  // bundle inlines it.
  it('builds a worker entry that imports node builtins only', async () => {
    const rootDirectory = await packageDirectory();
    const source = await readFile(
      path.join(rootDirectory ?? '', 'build/workers/tasks/script-runner.js'),
      'utf8'
    );
    const specifiers = [...source.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)].map(
      ([, specifier]) => specifier?.replace(/^node:/, '')
    );
    const allowedRelativeSpecifiers = new Set([
      '../../libraries/jwt-customizer-cryptographic-capability.js',
    ]);

    expect(specifiers.length).toBeGreaterThan(0);
    expect(
      specifiers.filter(
        (specifier) =>
          !builtinModules.includes(specifier ?? '') &&
          !allowedRelativeSpecifiers.has(specifier ?? '')
      )
    ).toEqual([]);
  });

  it('builds the cryptographic capability helper from node builtins only', async () => {
    const rootDirectory = await packageDirectory();
    const source = await readFile(
      path.join(rootDirectory ?? '', 'build/libraries/jwt-customizer-cryptographic-capability.js'),
      'utf8'
    );
    const specifiers = [...source.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)].map(
      ([, specifier]) => specifier?.replace(/^node:/, '')
    );

    expect(specifiers.length).toBeGreaterThan(0);
    expect(specifiers.filter((specifier) => !builtinModules.includes(specifier ?? ''))).toEqual([]);
  });
});
