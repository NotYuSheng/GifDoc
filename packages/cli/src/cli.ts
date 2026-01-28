#!/usr/bin/env node

/**
 * GifDoc CLI
 * Automated demo GIF generator for GitHub READMEs
 */

import { Command } from 'commander';
import { init } from './commands/init.js';
import { generate } from './commands/generate.js';
import { validate } from './commands/validate.js';

const program = new Command();

program
  .name('gifdoc')
  .description('Automated demo GIF generator for GitHub READMEs')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize GifDoc in your project')
  .action(async () => {
    try {
      await init();
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate demo GIFs from configuration')
  .option('-c, --config <path>', 'Config file path', 'gifdoc.yml')
  .option('-d, --demo <name>', 'Generate specific demo only')
  .action(async (options) => {
    try {
      await generate(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate gifdoc.yml configuration')
  .option('-c, --config <path>', 'Config file path', 'gifdoc.yml')
  .action(async (options) => {
    try {
      await validate(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
