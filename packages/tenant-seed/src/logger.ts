/**
 * Seeding runs inside the Logto server when a tenant is created, so it logs through the plain
 * console instead of the CLI's spinner output.
 */
export const consoleLog = {
  info: (...args: unknown[]) => {
    console.log(...args);
  },
  succeed: (...args: unknown[]) => {
    console.log(...args);
  },
};
