/**
 * Core type definitions for GifDoc
 */

export interface GifDocConfig {
  version: number;
  output: OutputConfig;
  demos: DemoConfig[];
  optimization?: OptimizationConfig;
  github?: GitHubConfig;
}

export interface OutputConfig {
  directory: string;
  prefix?: string;
}

export interface DemoConfig {
  name: string;
  script: string;
  width?: number;
  height?: number;
  fps?: number;
  maxDuration?: number;
}

export interface OptimizationConfig {
  maxSize?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface GitHubConfig {
  autoCommit?: boolean;
  updateReadme?: boolean;
}

/**
 * Options for recording a demo
 */
export interface RecordOptions {
  script: string;
  outputPath: string;
  width?: number;
  height?: number;
  maxDuration?: number;
}

/**
 * Options for converting video to GIF
 */
export interface ConvertOptions {
  videoPath: string;
  outputPath: string;
  fps?: number;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Options for optimizing GIF file size
 */
export interface OptimizeOptions {
  gifPath: string;
  maxSize?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Result of generating a demo GIF
 */
export interface GenerateResult {
  name: string;
  success: boolean;
  outputPath?: string;
  fileSize?: number;
  error?: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  width: 1280,
  height: 720,
  fps: 15,
  quality: 'medium' as const,
  maxDuration: 30,
} as const;
