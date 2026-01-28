/**
 * Generate command - Generate demo GIFs from configuration
 */

import { resolve, join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import {
  loadConfig,
  validateConfig,
  applyDefaults,
  recordDemo,
  convertToGif,
  optimizeGif,
  getFileSize,
  formatBytes,
  type GenerateResult,
} from '@gifdoc/core';

interface GenerateOptions {
  config?: string;
  demo?: string;
}

/**
 * Generate demo GIFs from configuration
 */
export async function generate(options: GenerateOptions = {}): Promise<void> {
  const configPath = resolve(options.config || 'gifdoc.yml');

  // Load configuration
  console.log(chalk.bold.blue('\nGifDoc - Demo GIF Generator\n'));

  const spinner = ora('Loading configuration...').start();

  let config;
  try {
    config = await loadConfig(configPath);
    await validateConfig(config, process.cwd());
    spinner.succeed('Configuration loaded');
  } catch (error) {
    spinner.fail('Failed to load configuration');
    throw error;
  }

  // Filter demos if specific demo name provided
  let demosToGenerate = config.demos;
  if (options.demo) {
    demosToGenerate = config.demos.filter((d) => d.name === options.demo);
    if (demosToGenerate.length === 0) {
      throw new Error(`Demo "${options.demo}" not found in configuration`);
    }
  }

  console.log(chalk.dim(`Generating ${demosToGenerate.length} demo(s)...\n`));

  // Generate each demo
  const results: GenerateResult[] = [];

  for (const demo of demosToGenerate) {
    const result = await generateDemo(demo, config.output.directory, config.output.prefix);
    results.push(result);
  }

  // Display results summary
  console.log('\n' + chalk.bold('Summary:\n'));

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    if (result.success) {
      console.log(
        chalk.green('✓') +
          ` ${result.name}: ${result.outputPath} (${formatBytes(result.fileSize || 0)})`
      );
    } else {
      console.log(chalk.red('✗') + ` ${result.name}: ${result.error}`);
    }
  });

  console.log(
    '\n' +
      chalk.bold(
        successCount > 0
          ? chalk.green(`✓ ${successCount} demo(s) generated successfully`)
          : ''
      )
  );

  if (failureCount > 0) {
    console.log(chalk.bold(chalk.red(`✗ ${failureCount} demo(s) failed`)));
    process.exit(1);
  }

  console.log();
}

/**
 * Generate a single demo GIF
 */
async function generateDemo(
  demo: any,
  outputDir: string,
  prefix: string = ''
): Promise<GenerateResult> {
  const demoWithDefaults = applyDefaults(demo);
  const outputPath = resolve(join(outputDir, `${prefix}${demo.name}.gif`));

  let spinner: Ora | null = null;

  try {
    // Step 1: Record video
    spinner = ora(`[${demo.name}] Recording demo...`).start();
    const videoPath = await recordDemo({
      script: demoWithDefaults.script,
      outputPath: outputPath.replace('.gif', '.mp4'),
      width: demoWithDefaults.width,
      height: demoWithDefaults.height,
      maxDuration: demoWithDefaults.maxDuration,
    });
    spinner.succeed(`[${demo.name}] Demo recorded`);

    // Step 2: Convert to GIF
    spinner = ora(`[${demo.name}] Converting to GIF...`).start();
    await convertToGif({
      videoPath,
      outputPath,
      fps: demoWithDefaults.fps,
      width: demoWithDefaults.width,
      height: demoWithDefaults.height,
      quality: 'medium', // TODO: Use quality from config
    });
    spinner.succeed(`[${demo.name}] Converted to GIF`);

    // Step 3: Optimize (if needed)
    const fileSize = getFileSize(outputPath);

    // TODO: Add optimization step
    // await optimizeGif({
    //   gifPath: outputPath,
    //   maxSize: config.optimization?.maxSize,
    //   quality: config.optimization?.quality,
    // });

    spinner = null;

    // Clean up video file
    try {
      const fs = await import('fs/promises');
      await fs.unlink(videoPath);
    } catch {
      // Ignore cleanup errors
    }

    return {
      name: demo.name,
      success: true,
      outputPath,
      fileSize,
    };
  } catch (error) {
    if (spinner) {
      spinner.fail(`[${demo.name}] Failed`);
    }

    return {
      name: demo.name,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
