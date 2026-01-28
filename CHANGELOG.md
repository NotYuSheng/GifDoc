# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Core package (@gifdoc/core) with Playwright recording and FFmpeg conversion
- CLI package (gifdoc) with init, generate, and validate commands
- GitHub Actions workflows for CI/CD, demo generation, and releases
- Comprehensive documentation and contribution guidelines

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release of GifDoc
- **Core Features:**
  - Playwright-based browser automation for video recording
  - FFmpeg-powered video-to-GIF conversion
  - Multi-quality preset system (low, medium, high, ultra)
  - YAML configuration with Zod validation
  - Configurable dimensions, FPS, and duration

- **CLI Commands:**
  - `gifdoc init` - Initialize project with templates
  - `gifdoc generate` - Generate GIFs from configuration
  - `gifdoc validate` - Validate configuration and dependencies

- **Developer Experience:**
  - TypeScript monorepo with npm workspaces
  - Comprehensive error handling and validation
  - Beautiful CLI with colors and spinners (chalk, ora)
  - Interactive prompts (inquirer)

- **Documentation:**
  - Complete README with examples
  - Contributing guidelines
  - Workflow documentation
  - Issue and PR templates

## Version History

### [1.0.0] - Initial Release
First stable release of GifDoc with core functionality for automated demo GIF generation.

---

## How to Read This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

## Links

- [Compare versions](https://github.com/yourusername/gifdoc/compare)
- [All releases](https://github.com/yourusername/gifdoc/releases)
- [Unreleased changes](https://github.com/yourusername/gifdoc/compare/v1.0.0...HEAD)
