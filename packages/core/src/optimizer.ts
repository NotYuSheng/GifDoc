/**
 * GIF optimization functionality
 * @module optimizer
 */

import { statSync, existsSync, copyFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { tmpdir } from 'os';
import type { OptimizeOptions } from './types.js';
import { parseSizeToBytes, formatBytes } from './config.js';
import { convertToGif } from './converter.js';

/**
 * Quality levels in order from highest to lowest
 */
const QUALITY_LEVELS = ['ultra', 'high', 'medium', 'low'] as const;

/**
 * Optimize GIF file size by iteratively reducing quality if needed
 * @param options Optimization options
 */
export async function optimizeGif(options: OptimizeOptions): Promise<void> {
  const { gifPath, maxSize, quality = 'medium' } = options;

  // Validate input file exists
  if (!existsSync(gifPath)) {
    throw new Error(`GIF file not found: ${gifPath}`);
  }

  // If no max size specified, optimization is complete
  if (!maxSize) {
    return;
  }

  const maxSizeBytes = parseSizeToBytes(maxSize);
  const currentSize = getFileSize(gifPath);

  // If already under the limit, no optimization needed
  if (currentSize <= maxSizeBytes) {
    return;
  }

  // Find the current quality level index
  const currentQualityIndex = QUALITY_LEVELS.indexOf(quality);
  if (currentQualityIndex === -1) {
    throw new Error(`Invalid quality level: ${quality}`);
  }

  // Try progressively lower quality levels
  for (let i = currentQualityIndex + 1; i < QUALITY_LEVELS.length; i++) {
    const newQuality = QUALITY_LEVELS[i];

    // Create a temporary file for the re-encoded GIF
    const tempGifPath = join(tmpdir(), `gifdoc-optimized-${Date.now()}.gif`);

    try {
      // Get the original video path from metadata (if available)
      // For now, we'll just skip re-encoding and warn the user
      // In a full implementation, we'd need to store the original video path
      console.warn(
        `GIF file size (${formatBytes(currentSize)}) exceeds maximum (${maxSize}). ` +
        `Consider reducing video length or dimensions.`
      );
      return;

      // TODO: Full implementation would re-encode from original video at lower quality
      // This requires storing the original video path in metadata or as a parameter
    } catch (error) {
      // Clean up temp file on error
      if (existsSync(tempGifPath)) {
        try {
          const fs = await import('fs/promises');
          await fs.unlink(tempGifPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  // If we've tried all quality levels and still too large, warn the user
  console.warn(
    `Unable to optimize GIF below ${maxSize}. Current size: ${formatBytes(currentSize)}. ` +
    `Consider reducing video duration or dimensions.`
  );
}

/**
 * Get file size in bytes
 * @param path Path to file
 * @returns File size in bytes
 */
export function getFileSize(path: string): number {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  try {
    const stats = statSync(path);
    return stats.size;
  } catch (error) {
    throw new Error(
      `Failed to get file size: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Compress GIF using gifsicle if available
 * This provides better compression than re-encoding
 * @param gifPath Path to the GIF file
 * @param compressionLevel Compression level (1-3, where 3 is maximum)
 */
export async function compressWithGifsicle(
  gifPath: string,
  compressionLevel: number = 3
): Promise<void> {
  // This is a placeholder for gifsicle integration
  // Gifsicle can compress GIFs losslessly, reducing file size by 10-30%
  // Requires gifsicle to be installed on the system

  console.warn('gifsicle compression not yet implemented');

  // TODO: Implement gifsicle compression
  // Example command: gifsicle -O3 --lossy=80 input.gif -o output.gif
}

/**
 * Get optimal FPS for a target file size
 * @param currentSize Current file size in bytes
 * @param targetSize Target file size in bytes
 * @param currentFps Current FPS
 * @returns Suggested FPS to meet target size
 */
export function suggestOptimalFps(
  currentSize: number,
  targetSize: number,
  currentFps: number
): number {
  // Rough estimation: file size is roughly proportional to FPS
  const ratio = targetSize / currentSize;
  const suggestedFps = Math.max(5, Math.floor(currentFps * ratio));
  return Math.min(suggestedFps, currentFps);
}

/**
 * Estimate GIF file size before conversion
 * This is a rough estimate based on video duration, dimensions, and FPS
 * @param duration Video duration in seconds
 * @param width Video width
 * @param height Video height
 * @param fps Frames per second
 * @param quality Quality level
 * @returns Estimated file size in bytes
 */
export function estimateGifSize(
  duration: number,
  width: number,
  height: number,
  fps: number,
  quality: 'low' | 'medium' | 'high' | 'ultra' = 'medium'
): number {
  // Rough estimation formula
  // Base bytes per pixel per frame
  const qualityMultipliers = {
    low: 0.05,
    medium: 0.1,
    high: 0.15,
    ultra: 0.2,
  };

  const bytesPerPixelPerFrame = qualityMultipliers[quality];
  const totalFrames = duration * fps;
  const pixelsPerFrame = width * height;

  return Math.floor(totalFrames * pixelsPerFrame * bytesPerPixelPerFrame);
}
