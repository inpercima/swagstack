#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';
import { initCommand } from './init.js';

console.log(chalk.cyan(figlet.textSync('swagstack')));
console.log(chalk.gray('An [s]mart [w]eb [a]pps monorepo [g]enerator for Angular with optional backend - full[stack] included.'));
console.log('');

const program = new Command();
program
  .name('swagstack')
  .description('An [s]mart [w]eb [a]pps monorepo [g]enerator for Angular with optional backend - full[stack] included.')
  .version('3.0.0-SNAPSHOT');
program.addCommand(initCommand());

await program.parseAsync(process.argv);
