/**
 * Configuration loading and validation
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';
import type { GifDocConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';

/**
 * Zod schema for GifDoc configuration
 */
const OutputConfigSchema = z.object({
  directory: z.string(),
  prefix: z.string().optional(),
});

const DemoConfigSchema = z.object({
  name: z.string(),
  script: z.string(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  fps: z.number().positive().max(60).optional(),
  maxDuration: z.number().positive().optional(),
});

const OptimizationConfigSchema = z.object({
  maxSize: z.string().regex(/^\d+(\.\d+)?(KB|MB|GB)$/i).optional(),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).optional(),
});

const GitHubConfigSchema = z.object({
  autoCommit: z.boolean().optional(),
  updateReadme: z.boolean().optional(),
});

const GifDocConfigSchema = z.object({
  version: z.number().int().positive(),
  output: OutputConfigSchema,
  demos: z.array(DemoConfigSchema).min(1),
  optimization: OptimizationConfigSchema.optional(),
  github: GitHubConfigSchema.optional(),
});

/**
 * Load and parse a GifDoc configuration file
 * @param configPath Path to gifdoc.yml or gifdoc.yaml
 * @returns Validated configuration object
 */
export async function loadConfig(configPath: string): Promise<GifDocConfig> {
  // Resolve the config path
  const resolvedPath = resolve(configPath);

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  // Read and parse YAML
  let rawConfig: unknown;
  try {
    const fileContent = readFileSync(resolvedPath, 'utf-8');
    rawConfig = yaml.load(fileContent);
  } catch (error) {
    throw new Error(
      `Failed to parse YAML configuration: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Validate with Zod
  const result = GifDocConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`Invalid configuration:\n${errors}`);
  }

  return result.data;
}

/**
 * Validate a configuration object
 * Performs additional checks beyond schema validation
 */
export async function validateConfig(
  config: GifDocConfig,
  baseDir: string = process.cwd()
): Promise<void> {
  const errors: string[] = [];

  // Check that output directory is specified
  if (!config.output.directory) {
    errors.push('Output directory must be specified');
  }

  // Check that at least one demo is configured
  if (!config.demos || config.demos.length === 0) {
    errors.push('At least one demo must be configured');
  }

  // Validate each demo
  for (const demo of config.demos) {
    // Check demo name is not empty
    if (!demo.name || demo.name.trim() === '') {
      errors.push(`Demo name cannot be empty`);
    }

    // Check script file exists
    const scriptPath = resolve(baseDir, demo.script);
    if (!existsSync(scriptPath)) {
      errors.push(`Demo script not found: ${demo.script} (resolved to ${scriptPath})`);
    }

    // Validate dimensions
    if (demo.width && demo.width < 100) {
      errors.push(`Demo "${demo.name}": width must be at least 100px`);
    }
    if (demo.height && demo.height < 100) {
      errors.push(`Demo "${demo.name}": height must be at least 100px`);
    }

    // Validate FPS
    if (demo.fps && (demo.fps < 1 || demo.fps > 60)) {
      errors.push(`Demo "${demo.name}": fps must be between 1 and 60`);
    }

    // Validate max duration
    if (demo.maxDuration && demo.maxDuration < 1) {
      errors.push(`Demo "${demo.name}": maxDuration must be at least 1 second`);
    }
  }

  // Check for duplicate demo names
  const demoNames = config.demos.map((d) => d.name);
  const duplicates = demoNames.filter((name, index) => demoNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate demo names found: ${duplicates.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n  - ${errors.join('\n  - ')}`);
  }
}

/**
 * Apply default values to a demo configuration
 */
export function applyDefaults(demo: z.infer<typeof DemoConfigSchema>): Required<z.infer<typeof DemoConfigSchema>> {
  return {
    name: demo.name,
    script: demo.script,
    width: demo.width ?? DEFAULT_CONFIG.width,
    height: demo.height ?? DEFAULT_CONFIG.height,
    fps: demo.fps ?? DEFAULT_CONFIG.fps,
    maxDuration: demo.maxDuration ?? DEFAULT_CONFIG.maxDuration,
  };
}

/**
 * Parse a size string (e.g., "5MB") to bytes
 */
export function parseSizeToBytes(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)(KB|MB|GB)$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  const multipliers: Record<string, number> = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };

  return Math.floor(value * multipliers[unit]);
}

/**
 * Format bytes to human-readable size string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}
