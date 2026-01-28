# Contributing to GifDoc

Thank you for your interest in contributing to GifDoc! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. **Fork and clone the repository**

```bash
git clone https://github.com/yourusername/gifdoc.git
cd gifdoc
```

2. **Install dependencies**

```bash
npm install
```

3. **Build all packages**

```bash
npm run build --workspaces
```

4. **Verify installation**

```bash
# Test the CLI
node packages/cli/bin/gifdoc.js --help

# Run validation
node packages/cli/bin/gifdoc.js validate --help
```

## Project Structure

```
gifdoc/
├── packages/
│   ├── core/              # @gifdoc/core - Core library
│   │   ├── src/          # TypeScript source files
│   │   ├── dist/         # Compiled JavaScript
│   │   └── package.json
│   │
│   ├── cli/              # gifdoc - CLI tool
│   │   ├── src/
│   │   │   ├── commands/ # CLI command implementations
│   │   │   └── cli.ts    # Main CLI entry point
│   │   ├── bin/          # Executable script
│   │   └── package.json
│   │
│   └── action/           # @gifdoc/action - GitHub Action (planned)
│
├── examples/             # Example projects
├── templates/            # Template files for init command
├── .github/
│   ├── workflows/        # GitHub Actions workflows
│   └── WORKFLOWS.md      # Workflow documentation
└── package.json          # Workspace root
```

## Development Workflow

### Making Changes

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

Edit files in the appropriate package:
- Core functionality: `packages/core/src/`
- CLI commands: `packages/cli/src/commands/`

3. **Build and test**

```bash
# Build changed packages
cd packages/core && npm run build
cd packages/cli && npm run build

# Test your changes
npm run test --workspaces --if-present
```

4. **Test the CLI locally**

```bash
# Create a test directory
mkdir -p /tmp/test-gifdoc
cd /tmp/test-gifdoc

# Run CLI commands
node /path/to/gifdoc/packages/cli/bin/gifdoc.js init
node /path/to/gifdoc/packages/cli/bin/gifdoc.js validate
```

### Code Style

- **TypeScript:** Use TypeScript for all new code
- **Formatting:** Follow existing code style
- **Imports:** Use ES modules (`import`/`export`)
- **Types:** Prefer explicit types over `any`
- **Comments:** Add JSDoc comments for public APIs

Example:

```typescript
/**
 * Record a Playwright script to video
 * @param options Recording options
 * @returns Path to the recorded video file
 */
export async function recordDemo(options: RecordOptions): Promise<string> {
  // Implementation
}
```

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat(core): add support for custom FFmpeg filters"
git commit -m "fix(cli): handle missing config file gracefully"
git commit -m "docs: update README with new examples"
git commit -m "chore(deps): update playwright to v1.40"
```

## Adding New Features

### Adding a New CLI Command

1. **Create the command file**

```typescript
// packages/cli/src/commands/mycommand.ts
export async function myCommand(options: MyOptions): Promise<void> {
  // Implementation
}
```

2. **Register in CLI**

```typescript
// packages/cli/src/cli.ts
import { myCommand } from './commands/mycommand.js';

program
  .command('mycommand')
  .description('Description of command')
  .action(async (options) => {
    await myCommand(options);
  });
```

3. **Export from index**

```typescript
// packages/cli/src/commands/index.ts
export { myCommand } from './mycommand.js';
```

### Adding Core Functionality

1. **Create module in core package**

```typescript
// packages/core/src/mymodule.ts
export function myFunction(): void {
  // Implementation
}
```

2. **Add types**

```typescript
// packages/core/src/types.ts
export interface MyOptions {
  // Options
}
```

3. **Export from index**

```typescript
// packages/core/src/index.ts
export { myFunction } from './mymodule.js';
export type { MyOptions } from './types.js';
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test --workspaces

# Run tests for specific package
cd packages/core && npm test

# Watch mode
cd packages/core && npm run test:watch
```

### Writing Tests

Use Vitest for testing:

```typescript
// packages/core/src/config.test.ts
import { describe, it, expect } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('should load valid configuration', async () => {
    const config = await loadConfig('./fixtures/valid.yml');
    expect(config.version).toBe(1);
  });

  it('should throw on invalid configuration', async () => {
    await expect(loadConfig('./fixtures/invalid.yml')).rejects.toThrow();
  });
});
```

## Pull Request Process

1. **Update documentation**
   - Update README.md if adding new features
   - Add JSDoc comments to new functions
   - Update CHANGELOG.md

2. **Ensure CI passes**
   - All tests pass
   - TypeScript compiles without errors
   - No linting errors

3. **Create pull request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe your changes in detail
   - Add screenshots/GIFs if relevant

4. **Review process**
   - Respond to review comments
   - Make requested changes
   - Keep PR focused and reasonably sized

## Issue Guidelines

### Reporting Bugs

When reporting bugs, include:

- **Description:** Clear description of the issue
- **Steps to reproduce:** Exact steps to reproduce the problem
- **Expected behavior:** What you expected to happen
- **Actual behavior:** What actually happened
- **Environment:**
  - OS and version
  - Node.js version
  - GifDoc version
- **Logs/errors:** Any relevant error messages or logs

**Template:**

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Run `gifdoc init`
2. Edit gifdoc.yml with...
3. Run `gifdoc generate`
4. See error

## Expected Behavior
GIFs should be generated successfully

## Actual Behavior
Error: ...

## Environment
- OS: Ubuntu 22.04
- Node.js: v18.17.0
- GifDoc: v1.0.0

## Logs
```
[error logs here]
```
```

### Feature Requests

When requesting features, include:

- **Use case:** Why you need this feature
- **Proposed solution:** How you envision it working
- **Alternatives:** Other solutions you've considered

## Community Guidelines

- **Be respectful:** Treat others with respect and kindness
- **Be constructive:** Provide helpful feedback
- **Be patient:** Maintainers are volunteers
- **Be clear:** Communicate clearly and concisely

## Getting Help

- **Documentation:** Check README.md and docs/
- **Issues:** Search existing issues before creating new ones
- **Discussions:** Use GitHub Discussions for questions
- **Discord/Slack:** Join our community chat (if available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- README.md contributors section
- GitHub's contributor graph

Thank you for contributing to GifDoc! 🎉
