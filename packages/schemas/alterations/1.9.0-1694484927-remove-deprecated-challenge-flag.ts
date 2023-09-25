import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Note:
 * In order to maintain compatibility with the database when staging,
 * data associated with the deprecated challenge flag should not be deleted in version 1.9.0.
 * However, the [PR](https://github.com/logto-io/logto/pull/4468) removed the relevant data by mistake.
 *
 * To prevent compatibility issues for new users who are upgrading, we removed the related alteration logic below.
 *
 * Also, since the database records the state of the database based on the timestamp in the script name, this script cannot be deleted.
 */
const alteration: AlterationScript = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  up: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  down: async () => {},
};

export default alteration;
