/**
 * Validate command - Validate gifdoc.yml configuration
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import { loadConfig, validateConfig } from '@gifdoc/core';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

interface ValidateOptions {
  config?: string;
}

/**
 * Validate gifdoc.yml configuration
 */
export async function validate(options: ValidateOptions = {}): Promise<void> {
  const configPath = resolve(options.config || 'gifdoc.yml');

  console.log(chalk.bold.blue('\nGifDoc Configuration Validation\n'));

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if config file exists
  if (!existsSync(configPath)) {
    errors.push(`Configuration file not found: ${configPath}`);
    printResults(errors, warnings);
    return;
  }

  console.log(chalk.dim(`Validating ${configPath}...\n`));

  // Load and validate configuration
  try {
    const config = await loadConfig(configPath);
    console.log(chalk.green('✓') + ' Configuration file syntax is valid');

    // Validate configuration
    await validateConfig(config, process.cwd());
    console.log(chalk.green('✓') + ' Configuration validation passed');

    // Check output directory
    if (!existsSync(resolve(config.output.directory))) {
      warnings.push(`Output directory does not exist: ${config.output.directory}`);
      warnings.push('  It will be created when you run "gifdoc generate"');
    } else {
      console.log(chalk.green('✓') + ' Output directory exists');
    }

    // Check each demo script
    console.log(chalk.dim('\nChecking demo scripts:'));
    for (const demo of config.demos) {
      const scriptPath = resolve(demo.script);
      if (existsSync(scriptPath)) {
        console.log(chalk.green('  ✓') + ` ${demo.name}: ${demo.script}`);
      } else {
        errors.push(`Demo "${demo.name}": script not found at ${demo.script}`);
      }
    }
  } catch (error) {
    errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Check FFmpeg availability
  console.log(chalk.dim('\nChecking dependencies:'));
  try {
    if (existsSync(ffmpegInstaller.path)) {
      console.log(chalk.green('✓') + ' FFmpeg is available');
    } else {
      warnings.push('FFmpeg not found. Video-to-GIF conversion may not work.');
    }
  } catch (error) {
    warnings.push('Could not verify FFmpeg installation');
  }

  // Check Playwright
  try {
    // Just check if playwright package exists
    await import('playwright');
    console.log(chalk.green('✓') + ' Playwright is installed');
  } catch (error) {
    errors.push('Playwright is not installed. Run: npm install playwright');
  }

  // Print results
  printResults(errors, warnings);
}

/**
 * Print validation results
 */
function printResults(errors: string[], warnings: string[]): void {
  console.log();

  if (errors.length > 0) {
    console.log(chalk.bold.red('Errors:\n'));
    errors.forEach((error) => {
      console.log(chalk.red('✗ ') + error);
    });
    console.log();
  }

  if (warnings.length > 0) {
    console.log(chalk.bold.yellow('Warnings:\n'));
    warnings.forEach((warning) => {
      console.log(chalk.yellow('⚠ ') + warning);
    });
    console.log();
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.bold.green('✓ All checks passed!\n'));
    console.log('Ready to generate GIFs. Run: ' + chalk.cyan('npx gifdoc generate\n'));
  } else if (errors.length === 0) {
    console.log(chalk.bold.yellow('⚠ Validation passed with warnings\n'));
  } else {
    console.log(chalk.bold.red('✗ Validation failed\n'));
    console.log('Please fix the errors above before generating GIFs.\n');
    process.exit(1);
  }
}
