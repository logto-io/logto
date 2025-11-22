# Shared resources

Everything that lives under `packages/experience/src/shared` is meant to be consumed by multiple surfaces (experience pages, layouts, containers, etc.). To keep these building blocks reliable, follow the guidelines below when refactoring or adding new modules.

1. **Keep imports self-contained.** A shared module must not reach back into feature-specific folders such as `components`, `hooks`, `pages`, or `utils` under the experience root. If it depends on a helper (hook, util, style, or asset) that currently lives outside the shared tree, migrate that helper alongside the module so the shared folder remains dependency-free from the rest of the app.
2. **Move hierarchies together.** When promoting a component (e.g. `NavBar`) make sure any children, styles, peer modules, or required assets (icons, images, etc.) move with it, so consumers only rely on the shared entry point and not on scattered pieces.
3. **Expose stable entry points.** Shared items should prefer named exports or clear default exports from index files so consumers can import from `@/shared/...` without digging into implementation details. If a module needs feature-specific behavior, pass it in via props/options rather than importing feature code directly.
4. **Document intent when unsure.** If a shared abstraction has nuances (e.g. expects search parameters to be stored in session), add a short comment or readme note explaining the contract so future refactors keep the shared boundaries intact.

Following these principles keeps `shared/` a safe, dependency-light cache of primitives that every experience can rely on.
