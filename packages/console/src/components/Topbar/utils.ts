import { version } from '../../../../core/package.json';

export { version as currentVersion } from '../../../../core/package.json';

/** Check if the target version is greater than the current Logto version. */
export const isGreaterThanCurrentVersion = (target: string) => {
  const latestComponents = (target.startsWith('v') ? target.slice(1) : target).split('.');
  const currentComponents = version.split('.');

  for (const [index, component] of latestComponents.entries()) {
    const current = currentComponents[index];
    if (!current || Number(current) < Number(component)) {
      return true;
    }

    if (Number(current) > Number(component)) {
      return false;
    }
  }
  return false;
};
