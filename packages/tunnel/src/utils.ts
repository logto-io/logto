import chalk from 'chalk';

export const exitOnFatalError = (error: unknown) => {
  console.error(chalk.red(error));

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
};
