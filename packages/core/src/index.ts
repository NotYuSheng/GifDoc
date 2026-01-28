/**
 * @gifdoc/core - Core library for automated demo GIF generation
 *
 * This package provides the core functionality for recording Playwright scripts
 * and converting them to optimized GIF files.
 */

// Re-export types
export type {
  GifDocConfig,
  OutputConfig,
  DemoConfig,
  OptimizationConfig,
  GitHubConfig,
  RecordOptions,
  ConvertOptions,
  OptimizeOptions,
  GenerateResult,
} from './types.js';

export { DEFAULT_CONFIG } from './types.js';

// Re-export config functions
export {
  loadConfig,
  validateConfig,
  applyDefaults,
  parseSizeToBytes,
  formatBytes,
} from './config.js';

// Placeholder exports for functions not yet implemented
// These will be implemented in Phase 2 and Phase 3
export { recordDemo } from './recorder.js';
export { convertToGif, convertWithGifski } from './converter.js';
export { optimizeGif, getFileSize } from './optimizer.js';
