#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './init.js';

const program = new Command();

program
  .name('swaaplate')
  .description('Opinionated monorepo generator (Angular + optional backend presets)')
  .version('3.0.0-SNAPSHOT');

program.addCommand(initCommand());

await program.parseAsync(process.argv);
