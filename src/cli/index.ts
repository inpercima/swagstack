#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';
import { initCommand } from './init.js';

console.log(chalk.cyan(figlet.textSync('swagstack')));
console.log(chalk.gray('A [s]mart [w]eb [a]pps [g]enerator, full[stack] included.'));
console.log('');

const program = new Command();
program
  .name('swaaplate')
  .description('A [s]mart [w]eb [a]pps [g]enerator, full[stack] included.')
  .version('3.0.0-SNAPSHOT');
program.addCommand(initCommand());

await program.parseAsync(process.argv);
