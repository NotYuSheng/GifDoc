/**
 * Video to GIF conversion functionality
 * @module converter
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import type { ConvertOptions } from './types.js';

// Set FFmpeg path from the installer package
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Quality settings for FFmpeg conversion
 */
const QUALITY_SETTINGS = {
  low: {
    fps: 10,
    scale: 'fast_bilinear',
    paletteStats: 'single',
  },
  medium: {
    fps: 15,
    scale: 'lanczos',
    paletteStats: 'single',
  },
  high: {
    fps: 20,
    scale: 'lanczos',
    paletteStats: 'full',
  },
  ultra: {
    fps: 30,
    scale: 'lanczos',
    paletteStats: 'diff',
  },
} as const;

/**
 * Convert video to GIF using FFmpeg with optimized palette
 * @param options Conversion options
 * @returns Path to the generated GIF file
 */
export async function convertToGif(options: ConvertOptions): Promise<string> {
  const {
    videoPath,
    outputPath,
    fps,
    width,
    height,
    quality = 'medium',
  } = options;

  // Validate input file exists
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Ensure output directory exists
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Get quality settings
  const qualitySettings = QUALITY_SETTINGS[quality];
  const targetFps = fps ?? qualitySettings.fps;

  // Create temporary palette file
  const paletteFile = join(tmpdir(), `gifdoc-palette-${Date.now()}.png`);

  try {
    // Step 1: Generate optimized color palette
    await generatePalette(videoPath, paletteFile, targetFps, qualitySettings.paletteStats, width, height);

    // Step 2: Convert video to GIF using the palette
    await convertWithPalette(videoPath, outputPath, paletteFile, targetFps, qualitySettings.scale, width, height);

    return outputPath;
  } finally {
    // Clean up temporary palette file
    if (existsSync(paletteFile)) {
      try {
        const fs = await import('fs/promises');
        await fs.unlink(paletteFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Generate an optimized color palette from the video
 */
function generatePalette(
  videoPath: string,
  paletteFile: string,
  fps: number,
  statsMode: string,
  width?: number,
  height?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath)
      .outputOptions([
        `-vf fps=${fps},scale=${width || -1}:${height || -1}:flags=lanczos,palettegen=stats_mode=${statsMode}`,
      ])
      .output(paletteFile)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Failed to generate palette: ${err.message}`)));

    command.run();
  });
}

/**
 * Convert video to GIF using the generated palette
 */
function convertWithPalette(
  videoPath: string,
  outputPath: string,
  paletteFile: string,
  fps: number,
  scaleAlgorithm: string,
  width?: number,
  height?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const scaleFilter = `fps=${fps},scale=${width || -1}:${height || -1}:flags=${scaleAlgorithm}`;
    const paletteUseFilter = 'paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle';

    ffmpeg(videoPath)
      .input(paletteFile)
      .complexFilter([
        `[0:v]${scaleFilter}[scaled]`,
        `[scaled][1:v]${paletteUseFilter}[out]`,
      ])
      .outputOptions(['-map [out]'])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Failed to convert video to GIF: ${err.message}`)))
      .on('progress', (progress) => {
        // Optional: could emit progress events here
        if (progress.percent) {
          // console.log(`Converting: ${Math.round(progress.percent)}%`);
        }
      })
      .run();
  });
}

/**
 * Convert video to GIF using gifski (higher quality alternative)
 * Note: Requires gifski to be installed on the system
 * @param options Conversion options
 * @returns Path to the generated GIF file
 */
export async function convertWithGifski(options: ConvertOptions): Promise<string> {
  const { videoPath, outputPath, fps = 15, width, height } = options;

  // This is a placeholder for gifski integration
  // Gifski provides higher quality GIFs but requires separate installation
  // For now, fall back to FFmpeg conversion
  console.warn('gifski conversion not yet implemented, falling back to FFmpeg');
  return convertToGif(options);
}

/**
 * Get video metadata (duration, dimensions, etc.)
 */
export function getVideoMetadata(videoPath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to read video metadata: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      // Parse frame rate
      let fps = 30; // default
      if (videoStream.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
        fps = num / den;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps,
      });
    });
  });
}
