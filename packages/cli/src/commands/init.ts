/**
 * Init command - Initialize GifDoc in a project
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Initialize GifDoc in the current project
 */
export async function init(): Promise<void> {
  console.log(chalk.bold.blue('\nGifDoc Initialization\n'));

  const configPath = resolve('gifdoc.yml');
  const demosDir = resolve('demos');

  // Check if gifdoc.yml already exists
  if (existsSync(configPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'gifdoc.yml already exists. Overwrite?',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('Initialization cancelled.'));
      return;
    }
  }

  // Create demos directory
  if (!existsSync(demosDir)) {
    mkdirSync(demosDir, { recursive: true });
    console.log(chalk.green('✓') + ' Created demos/ directory');
  }

  // Create gifdoc.yml
  const configTemplate = getConfigTemplate();
  writeFileSync(configPath, configTemplate);
  console.log(chalk.green('✓') + ' Created gifdoc.yml');

  // Create example demo script
  const demoScriptPath = join(demosDir, 'example.spec.ts');
  if (!existsSync(demoScriptPath)) {
    const demoTemplate = getDemoTemplate();
    writeFileSync(demoScriptPath, demoTemplate);
    console.log(chalk.green('✓') + ' Created demos/example.spec.ts');
  }

  // Ask about GitHub Action
  const { setupAction } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupAction',
      message: 'Set up GitHub Action for automatic GIF generation?',
      default: false,
    },
  ]);

  if (setupAction) {
    const workflowDir = resolve('.github/workflows');
    mkdirSync(workflowDir, { recursive: true });

    const workflowPath = join(workflowDir, 'gifdoc.yml');
    const workflowTemplate = getWorkflowTemplate();
    writeFileSync(workflowPath, workflowTemplate);
    console.log(chalk.green('✓') + ' Created .github/workflows/gifdoc.yml');
  }

  console.log(chalk.bold.green('\n✓ GifDoc initialized successfully!\n'));
  console.log('Next steps:');
  console.log('  1. Edit demos/example.spec.ts to create your demo script');
  console.log('  2. Run ' + chalk.cyan('npx gifdoc generate') + ' to create your first GIF');
  console.log('  3. Check the demos/ directory for the generated GIF\n');
}

/**
 * Get the gifdoc.yml template
 */
function getConfigTemplate(): string {
  return `# GifDoc Configuration
# Learn more: https://github.com/yourusername/gifdoc

version: 1

output:
  directory: ./demos
  prefix: demo_

demos:
  - name: example
    script: ./demos/example.spec.ts
    width: 1280
    height: 720
    fps: 15
    maxDuration: 15  # seconds

optimization:
  maxSize: 5MB
  quality: medium  # low, medium, high, ultra

github:
  autoCommit: false
  updateReadme: false
`;
}

/**
 * Get the demo script template
 */
function getDemoTemplate(): string {
  return `/**
 * Example GifDoc demo script
 *
 * This script demonstrates how to create a demo GIF using Playwright.
 * The default export should be an async function that accepts a Playwright page object.
 */

import type { Page } from 'playwright';

export default async function demo(page: Page) {
  // Navigate to your application
  // Replace this URL with your app's URL
  await page.goto('https://example.com');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Perform demo actions
  // Example: Fill a form, click buttons, navigate pages, etc.

  // Add a delay to make the demo more visible
  await page.waitForTimeout(1000);

  // More demo actions...
  // await page.click('button#my-button');
  // await page.fill('input#my-input', 'Hello, GifDoc!');

  console.log('Demo recording completed!');
}
`;
}

/**
 * Get the GitHub Action workflow template
 */
function getWorkflowTemplate(): string {
  return `name: Generate Demo GIFs

on:
  push:
    branches: [ main ]
    paths:
      - 'demos/**'
      - 'gifdoc.yml'
  workflow_dispatch:

jobs:
  generate-gifs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install -g gifdoc
          npx playwright install --with-deps chromium

      - name: Generate GIFs
        run: npx gifdoc generate

      - name: Commit generated GIFs
        if: github.event_name == 'push'
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add demos/*.gif
          git diff --staged --quiet || git commit -m "Update demo GIFs [skip ci]"
          git push
`;
}
