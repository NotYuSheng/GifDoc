/**
 * GifDoc CLI - Public API
 * @module gifdoc
 */

// Re-export commands for programmatic usage
export { init } from './commands/init.js';
export { generate } from './commands/generate.js';
export { validate } from './commands/validate.js';

// Re-export core library types and functions
export type {
  GifDocConfig,
  DemoConfig,
  OutputConfig,
  OptimizationConfig,
  GitHubConfig,
  GenerateResult,
} from '@gifdoc/core';
