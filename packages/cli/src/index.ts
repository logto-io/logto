import { Command } from 'commander';
import dotenv from 'dotenv';

import database from './commands/database';

dotenv.config();

const program = new Command();

program.addCommand(database);
program.parse(process.argv);
