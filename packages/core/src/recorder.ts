/**
 * Playwright video recording functionality
 * @module recorder
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { resolve, join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import type { RecordOptions } from './types.js';

/**
 * Record a Playwright script to video
 * @param options Recording options
 * @returns Path to the recorded video file
 */
export async function recordDemo(options: RecordOptions): Promise<string> {
  const { script, outputPath, width = 1280, height = 720, maxDuration } = options;

  // Resolve the script path
  const scriptPath = resolve(script);
  if (!existsSync(scriptPath)) {
    throw new Error(`Script file not found: ${scriptPath}`);
  }

  // Create a temporary directory for video recording
  const videoDir = join(tmpdir(), `gifdoc-${Date.now()}`);
  mkdirSync(videoDir, { recursive: true });

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let videoPath: string | null = null;

  try {
    // Launch browser with video recording enabled
    browser = await chromium.launch({
      headless: true,
    });

    context = await browser.newContext({
      viewport: { width, height },
      recordVideo: {
        dir: videoDir,
        size: { width, height },
      },
    });

    page = await context.newPage();

    // Set up timeout if maxDuration is specified
    const timeoutPromise = maxDuration
      ? new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Recording exceeded maximum duration of ${maxDuration} seconds`));
          }, maxDuration * 1000);
        })
      : null;

    // Load and execute the user's Playwright script
    const scriptModule = await import(scriptPath);
    const scriptFunction = scriptModule.default || scriptModule;

    if (typeof scriptFunction !== 'function') {
      throw new Error(
        `Script must export a default function. Expected format: export default async (page) => { ... }`
      );
    }

    // Execute the script with optional timeout
    if (timeoutPromise) {
      await Promise.race([scriptFunction(page), timeoutPromise]);
    } else {
      await scriptFunction(page);
    }

    // Get the video reference before closing
    const video = page.video();
    if (!video) {
      throw new Error('Video recording was not enabled');
    }

    // Close the page and context to ensure video is saved
    await page.close();
    await context.close();

    // Wait for the video file to be saved
    videoPath = await video.path();

    if (!videoPath || !existsSync(videoPath)) {
      throw new Error('Video file was not created');
    }

    return videoPath;
  } catch (error) {
    // Clean up on error
    if (page && !page.isClosed()) {
      await page.close().catch(() => {});
    }
    if (context) {
      await context.close().catch(() => {});
    }

    if (error instanceof Error) {
      throw new Error(`Failed to record demo: ${error.message}`);
    }
    throw new Error(`Failed to record demo: ${String(error)}`);
  } finally {
    // Clean up timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Close browser
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Validate that a Playwright script file is properly formatted
 * @param scriptPath Path to the script file
 * @returns True if valid, throws error otherwise
 */
export async function validateScript(scriptPath: string): Promise<boolean> {
  const resolvedPath = resolve(scriptPath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Script file not found: ${resolvedPath}`);
  }

  try {
    const scriptModule = await import(resolvedPath);
    const scriptFunction = scriptModule.default || scriptModule;

    if (typeof scriptFunction !== 'function') {
      throw new Error(
        'Script must export a default function. Expected format: export default async (page) => { ... }'
      );
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid script: ${error.message}`);
    }
    throw new Error(`Invalid script: ${String(error)}`);
  }
}
