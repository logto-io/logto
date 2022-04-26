const { execSync, spawn, spawnSync } = require('child_process');
const { existsSync } = require('fs');
const readline = require('readline');

const isVersionGreaterThan = (version, targetMajor) => Number(version.split('.')[0]) >= targetMajor;

const trimV = (version) => version.startsWith('v') ? version.slice(1) : version;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const directory = 'logto';

(async () => {
  if (existsSync(directory)) {
    throw new Error(`\`${directory}\` already exists in current directory.`);
  }

  const nodeVersion = execSync('node -v', { encoding: 'utf-8' });
  const pgOutput = execSync('postgres --version', { encoding: 'utf-8' });

  if (!isVersionGreaterThan(trimV(nodeVersion), 16)) {
    throw new Error('Logto requires NodeJS>=16.0.0');
  }

  const pgArray = pgOutput.split(' ');
  const pgVersion = pgArray[pgArray.length - 1];

  if (!isVersionGreaterThan(trimV(pgVersion), 14)) {
    throw new Error('Logto requires PostgreSQL>=14.0.0');
  }

  spawnSync(
    'sh',
    ['-c', 'curl -L https://github.com/logto-io/logto/releases/latest/download/logto.tar.gz | tar -xz'],
    { stdio: 'inherit' },
  );

  rl.question('Would you like to start Logto now? (Y/n) ', (answer) => {
    rl.close();

    const startCommand = `cd ${directory} && npm start`;

    if (answer === '' || ['y', 'yeah', 'yes'].includes(answer.toLowerCase())) {
      spawn('sh', ['-c', startCommand], { stdio: 'inherit' });
    } else {
      console.log(`You can use \`${startCommand}\` to start Logto. Happy hacking!`);
    }
  })
})();
