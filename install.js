const { execSync, spawn, spawnSync } = require('child_process');
const { existsSync } = require('fs');
const readline = require('readline');

const isVersionGreaterThan = (version, targetMajor) => Number(version.split('.')[0]) >= targetMajor;

const trimV = (version) => version.startsWith('v') ? version.slice(1) : version;

const question = async (query) => new Promise((resolve) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  });
});

const confirm = async (query) => {
  const answer = await question(`${query} (Y/n) `);
  return answer === '' || ['y', 'yes', 'yep', 'yeah'].includes(answer);
};

const safeExecSync = (command) => {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch {}
};

const directory = 'logto';
const nodeMajorVersion = 16;
const postgresMajorVersion = 14;

(async () => {
  if (existsSync(directory)) {
    throw new Error(`\`${directory}\` already exists in the current directory.`);
  }

  const nodeVersion = execSync('node -v', { encoding: 'utf-8' });

  if (!isVersionGreaterThan(trimV(nodeVersion), nodeMajorVersion)) {
    throw new Error(`Logto requires NodeJS >= ${nodeMajorVersion}.0.0.`);
  }

  const pgOutput = safeExecSync('postgres --version') ?? '';
  const pgArray = pgOutput.split(' ');
  const pgVersion = pgArray[pgArray.length - 1];

  if (!isVersionGreaterThan(trimV(pgVersion), postgresMajorVersion)) {
    const answer = await confirm(`Logto requires PostgreSQL >= ${postgresMajorVersion}.0.0 but cannot find in the current environment.\nDo you have a remote PostgreSQL instance ready?`);
    if (!answer) {
      process.exit(1);
    }
  }

  // Download and extract
  spawnSync(
    'sh',
    ['-c', 'curl -L https://github.com/logto-io/logto/releases/latest/download/logto.tar.gz | tar -xz'],
    { stdio: 'inherit' },
  );

  const startCommand = `cd ${directory} && npm start`;
  const answer = await confirm('Would you like to start Logto now?');

  if (answer) {
    spawn('sh', ['-c', startCommand], { stdio: 'inherit' });
  } else {
    console.log(`You can use \`${startCommand}\` to start Logto. Happy hacking!`);
  }
})();
