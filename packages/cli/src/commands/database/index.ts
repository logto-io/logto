import { Argument, Command, Option } from 'commander';

import { createDatabase, createDatabaseCli } from './library';
import { replaceDsnDatabase } from './utilities';

const versionNote = 'Note Logto requires Postgres v14 or higher.';
const database = new Command('database');

const args = {
  database: new Argument('[database]', 'The Logto database name.').default('logto'),
};

const options = {
  dsn: new Option(
    '-d --dsn <address>',
    `Your Postgres DSN *WITHOUT* database name.\n${versionNote}`
  )
    .env('DSN')
    .makeOptionMandatory(),
  domain: new Option('--domain <domain>', 'The Logto domain for table seeding.')
    .env('DOMAIN')
    .makeOptionMandatory(),
};

database.alias('db');

database
  .command('create')
  .description('Create a Logto databse.')
  .addArgument(args.database)
  .addOption(options.dsn)
  .action(async (databaseName: unknown, options: Record<string, unknown>) => {
    await createDatabase(String(options.dsn), String(databaseName));
  });

database
  .command('create-tables')
  .description('Create Logto database tables without data.')
  .addArgument(args.database)
  .addOption(options.dsn)
  .action(async (databaseName: unknown, options: Record<string, unknown>) => {
    const cli = createDatabaseCli(replaceDsnDatabase(String(options.dsn), String(databaseName)));
    await cli.createTables();
    await cli.end();
  });

database
  .command('seed-tables')
  .description('Seed tables with necessary data to run Logto.')
  .addArgument(args.database)
  .addOption(options.dsn)
  .addOption(options.domain)
  .action(async (databaseName: unknown, options: Record<string, unknown>) => {
    const cli = createDatabaseCli(replaceDsnDatabase(String(options.dsn), String(databaseName)));
    await cli.seedTables(String(options.domain));
    await cli.end();
  });

database
  .command('init')
  .description(`Create and initialize a Logto database with tables and data in the DSN.`)
  .addArgument(args.database)
  .addOption(options.dsn)
  .addOption(options.domain)
  .action(async (databaseName: unknown, options: Record<string, unknown>) => {
    const dsn = await createDatabase(String(options.dsn), String(databaseName));
    const cli = createDatabaseCli(dsn);
    await cli.createTables();
    await cli.seedTables(String(options.domain));
    await cli.end();
  });

export default database;
