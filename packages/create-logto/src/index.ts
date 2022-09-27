import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';

import decompress from 'decompress';
import prompt from 'prompts';

import { downloadFile, isVersionGreaterThan, safeExecSync, trimV } from './functions';

const DIRECTORY = 'logto';
const NODE_MAJOR_VERSION = 16;
const POSTGRES_MAJOR_VERSION = 14;

async function main() {
  const nodeVersion = execSync('node -v', { encoding: 'utf8', stdio: 'pipe' });
  const pgOutput = safeExecSync('postgres --version') ?? '';
  const pgArray = pgOutput.split(' ');
  const pgVersion = pgArray[pgArray.length - 1]!;

  if (!isVersionGreaterThan(trimV(nodeVersion), NODE_MAJOR_VERSION)) {
    throw new Error(`Logto requires NodeJS >= ${NODE_MAJOR_VERSION}.0.0.`);
  }

  let response;

  try {
    response = await prompt(
      [
        {
          name: 'instancePath',
          message: 'Where should we create your logto instance?',
          type: 'text',
          initial: './' + DIRECTORY,
          format: (value: string) => path.resolve(value.trim()),
          validate: (value: string) =>
            existsSync(value) ? 'That path already exists, please try another.' : true,
        },
        {
          name: 'hasPostgresUrl',
          message: `Logto requires PostgreSQL >= ${POSTGRES_MAJOR_VERSION}.0.0 but cannot find in the current environment. Do you have a remote PostgreSQL instance ready?`,
          type: !isVersionGreaterThan(trimV(pgVersion), POSTGRES_MAJOR_VERSION) ? 'confirm' : null,
          initial: true,
        },
        {
          name: 'postgresUrl',
          message: 'What is the URL of your PostgreSQL instance?',
          type: (_, data) => (data.hasPostgresUrl ? 'text' : null),
          format: (value: string) => value.trim(),
          validate: (value: string) =>
            (value &&
              Boolean(
                /^(?:([^\s#/:?]+):\/{2})?(?:([^\s#/?@]+)@)?([^\s#/?]+)?(?:\/([^\s#?]*))?(?:\?([^\s#]+))?\S*$/.test(
                  value
                )
              )) ||
            'Please enter a valid connection URL.',
        },
        {
          name: 'startInstance',
          message: 'Would you like to start Logto now?',
          type: 'confirm',
          initial: true,
        },
      ],
      {
        onCancel: () => {
          throw new Error('Operation cancelled');
        },
      }
    );
  } catch (error: any) {
    console.log(error.message);

    return;
  }

  const startCommand = `cd ${response.instancePath} && npm start`;
  const tarFileLocation = path.resolve('./logto.tar.gz');

  await downloadFile(
    'https://github.com/logto-io/logto/releases/latest/download/logto.tar.gz',
    tarFileLocation
  );
  await decompress(tarFileLocation, response.instancePath);
  await unlink(tarFileLocation);

  if (response.startInstance) {
    execSync(startCommand, { stdio: 'inherit' });
  } else {
    console.log(`You can use ${startCommand} to start Logto. Happy hacking!`);
  }
}

main();
