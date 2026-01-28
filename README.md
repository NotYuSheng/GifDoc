# GifDoc

**Automated demo GIF generator for GitHub READMEs**

GifDoc solves the problem of outdated demo GIFs in README files by automating the entire workflow. Write Playwright scripts that demonstrate your app's features, and GifDoc records them as optimized GIFs.

## Features

- **Automated Recording**: Use Playwright scripts to record browser interactions
- **Optimized GIFs**: FFmpeg-powered conversion with customizable quality settings
- **Easy Configuration**: Simple YAML configuration file
- **CLI Tool**: Simple commands to initialize, validate, and generate GIFs
- **GitHub Actions**: Optional automation to update GIFs on code changes

## Installation

```bash
npm install -g gifdoc
```

Or use with npx:

```bash
npx gifdoc init
```

## Quick Start

### 1. Initialize GifDoc in your project

```bash
npx gifdoc init
```

This creates:
- `gifdoc.yml` - Configuration file
- `demos/` - Directory for demo scripts
- `demos/example.spec.ts` - Example Playwright script
- `.github/workflows/gifdoc.yml` - Optional GitHub Action

### 2. Edit your demo script

Edit `demos/example.spec.ts` to demonstrate your app:

```typescript
import type { Page } from 'playwright';

export default async function demo(page: Page) {
  // Navigate to your application
  await page.goto('http://localhost:3000');

  // Perform demo actions
  await page.click('button#start');
  await page.fill('input#name', 'Hello, GifDoc!');
  await page.click('button#submit');

  // Wait for result
  await page.waitForSelector('.result');
}
```

### 3. Generate your GIF

```bash
npx gifdoc generate
```

Your GIF will be created in the `demos/` directory!

## Configuration

The `gifdoc.yml` file controls all aspects of GIF generation:

```yaml
version: 1

output:
  directory: ./demos
  prefix: demo_

demos:
  - name: login-flow
    script: ./demos/login-flow.spec.ts
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
```

### Configuration Options

#### `output`
- `directory`: Where to save generated GIFs
- `prefix`: Optional prefix for GIF filenames

#### `demos`
Each demo can specify:
- `name`: Unique identifier for the demo
- `script`: Path to Playwright script file
- `width`: Video width (default: 1280)
- `height`: Video height (default: 720)
- `fps`: Frames per second (default: 15)
- `maxDuration`: Maximum recording time in seconds (default: 30)

#### `optimization`
- `maxSize`: Maximum file size (e.g., "5MB")
- `quality`: Quality level - `low`, `medium`, `high`, or `ultra`

## CLI Commands

### `gifdoc init`

Initialize GifDoc in your project. Creates configuration files and example scripts.

```bash
npx gifdoc init
```

### `gifdoc generate`

Generate GIFs from your configuration.

```bash
# Generate all demos
npx gifdoc generate

# Generate specific demo
npx gifdoc generate --demo login-flow

# Use custom config file
npx gifdoc generate --config custom.yml
```

### `gifdoc validate`

Validate your configuration and check dependencies.

```bash
npx gifdoc validate
```

## Project Structure

```
gifdoc/
├── packages/
│   ├── core/              # Core library (@gifdoc/core)
│   │   ├── src/
│   │   │   ├── config.ts     # Configuration loading
│   │   │   ├── recorder.ts   # Playwright recording
│   │   │   ├── converter.ts  # Video-to-GIF conversion
│   │   │   ├── optimizer.ts  # GIF optimization
│   │   │   └── types.ts      # TypeScript types
│   │   └── package.json
│   │
│   └── cli/               # CLI tool (gifdoc)
│       ├── src/
│       │   ├── commands/
│       │   │   ├── init.ts
│       │   │   ├── generate.ts
│       │   │   └── validate.ts
│       │   └── cli.ts
│       └── package.json
│
├── package.json          # Workspace root
└── README.md
```

## Development

This project uses npm workspaces for managing the monorepo.

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build --workspaces

# Build specific package
cd packages/core && npm run build
```

### Testing

```bash
# Run tests
npm run test --workspaces

# Watch mode
cd packages/core && npm run test:watch
```

## How It Works

1. **Recording**: GifDoc uses Playwright to launch a headless browser and execute your demo script. The browser context is configured to record video.

2. **Conversion**: The recorded video is converted to GIF using FFmpeg with an optimized two-pass process:
   - First pass: Generate a color palette from the video
   - Second pass: Create the GIF using the palette for better quality

3. **Optimization**: GIFs are optionally compressed to meet size constraints while maintaining quality.

## Technology Stack

- **Playwright**: Browser automation and video recording
- **FFmpeg**: Video-to-GIF conversion (@ffmpeg-installer/ffmpeg)
- **TypeScript**: Type-safe codebase
- **Commander**: CLI framework
- **Zod**: Configuration validation
- **Chalk, Ora, Inquirer**: Beautiful CLI UX

## Status

**Current Status**: MVP Complete (Phases 1-4)

### ✅ Completed
- Core package with configuration, recording, and conversion
- CLI with init, generate, and validate commands
- Template files for quick setup
- FFmpeg-based video-to-GIF conversion
- Configuration validation with Zod

### 🚧 Remaining Work
- Phase 5: Example project with working demo app
- Phase 6: GitHub Action package
- Phase 7: Comprehensive tests and documentation

## Roadmap

- [ ] Example project with simple demo app
- [ ] GitHub Action for CI/CD integration
- [ ] Comprehensive test suite
- [ ] Advanced optimization with gifsicle
- [ ] Support for multiple browsers
- [ ] Video trimming and editing
- [ ] WebM output format option
- [ ] Progress events and hooks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

YS
