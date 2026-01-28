# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for the GifDoc project.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual trigger via workflow_dispatch

**Jobs:**

#### `build-and-test`
- Installs dependencies
- Builds all workspace packages
- Runs tests (when available)
- Uploads build artifacts

#### `quality-check`
- Runs TypeScript type checking for all packages
- Ensures no type errors in the codebase

#### `test-cli`
- Tests CLI commands in a clean environment
- Verifies `gifdoc init` creates all expected files
- Validates configuration files
- Ensures CLI is working correctly

**Usage:**
This workflow runs automatically on every push and PR. No manual intervention needed.

---

### 2. Generate Demo GIFs (`demo-generation.yml`)

**Triggers:**
- Push to `main` branch with changes to:
  - `examples/**`
  - `demos/**`
  - `gifdoc.yml`
- Manual trigger with optional demo name parameter

**Jobs:**

#### `generate-demos`
- Builds the GifDoc project
- Installs Playwright browsers
- Generates demo GIFs using GifDoc itself
- Uploads GIFs as artifacts
- Commits and pushes GIFs to repository (on main branch)
- Comments on PRs with GIF preview information

**Manual Trigger:**
```bash
# Via GitHub UI: Actions → Generate Demo GIFs → Run workflow
# Optionally specify a demo name to generate only that demo
```

**Usage Examples:**

1. **Automatic generation:**
   - Edit a demo script in `examples/` or `demos/`
   - Commit and push to main
   - Workflow automatically generates updated GIFs

2. **Manual generation:**
   - Go to Actions tab in GitHub
   - Select "Generate Demo GIFs"
   - Click "Run workflow"
   - Optionally enter a specific demo name
   - Wait for completion and download artifacts

---

### 3. Release (`release.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`)
- Manual trigger with version input

**Jobs:**

#### `release`
- Builds and tests the project
- Updates package.json versions
- Creates GitHub Release with release notes
- Uploads release artifacts
- (Optional) Publishes to npm registry

**Creating a Release:**

#### Method 1: Using Git Tags
```bash
# Update version in package.json files
npm version 1.0.0 --workspaces --no-git-tag-version

# Commit changes
git add .
git commit -m "chore: bump version to 1.0.0"

# Create and push tag
git tag v1.0.0
git push origin main --tags
```

#### Method 2: Manual Trigger
1. Go to Actions → Release → Run workflow
2. Enter version number (e.g., `1.0.0`)
3. Click "Run workflow"

**Publishing to npm:**

The npm publishing steps are commented out by default. To enable:

1. Create an npm access token at https://www.npmjs.com/settings/[username]/tokens
2. Add it as `NPM_TOKEN` secret in GitHub repository settings
3. Uncomment the publish steps in `release.yml`

---

## Workflow Configuration

### Required Secrets

For full functionality, add these secrets to your repository:

1. **NPM_TOKEN** (optional, for publishing)
   - Settings → Secrets and variables → Actions → New repository secret
   - Value: npm access token with publish permissions

2. **GITHUB_TOKEN** (automatic)
   - Provided automatically by GitHub Actions
   - Used for creating releases and pushing commits

### Required Permissions

Ensure the repository settings have:
- Actions → General → Workflow permissions → Read and write permissions
- This allows workflows to commit GIFs back to the repository

---

## Local Testing

You can test the workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI workflow
act push

# Run specific job
act -j build-and-test

# Run with secrets
act -s GITHUB_TOKEN=your_token
```

---

## Workflow Best Practices

### For GifDoc Users

When using GifDoc in your own projects, follow this pattern:

```yaml
name: Update Demo GIFs

on:
  push:
    branches: [ main ]
    paths:
      - 'demos/**'
      - 'gifdoc.yml'
      - 'src/**'  # Regenerate if source code changes

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install GifDoc
        run: npm install -g gifdoc

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Generate GIFs
        run: npx gifdoc generate

      - name: Commit GIFs
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add demos/*.gif
          git diff --staged --quiet || git commit -m "Update GIFs [skip ci]"
          git push
```

### Tips

1. **Skip CI on GIF commits:** Use `[skip ci]` in commit messages to prevent infinite loops
2. **Artifact retention:** Adjust `retention-days` based on your needs (default: 30 days for demos)
3. **Browser caching:** Consider caching Playwright browsers to speed up workflows
4. **Conditional execution:** Use `if` conditions to control when workflows run

---

## Troubleshooting

### GIF Generation Fails

**Problem:** Workflow fails during GIF generation

**Solutions:**
1. Check Playwright installation: `npx playwright install --with-deps chromium`
2. Verify demo scripts have no errors
3. Run `gifdoc validate` locally first
4. Check workflow logs for specific error messages

### Commit Push Fails

**Problem:** Workflow can't push commits back to repository

**Solutions:**
1. Check repository permissions (Settings → Actions → Workflow permissions)
2. Ensure branch protection rules allow workflow commits
3. Verify GITHUB_TOKEN has write permissions

### Build Artifacts Not Found

**Problem:** Can't download artifacts or artifacts are empty

**Solutions:**
1. Check if GIFs were actually generated (workflow logs)
2. Verify `path` patterns in upload-artifact step
3. Ensure demos directory exists and is not gitignored

---

## Monitoring and Notifications

### Email Notifications

GitHub automatically sends emails on workflow failures to:
- Workflow author (person who triggered it)
- Repository collaborators (configurable)

### Slack/Discord Notifications

Add notification steps to workflows:

```yaml
- name: Notify on Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Status Badges

Add workflow status badges to README:

```markdown
![CI](https://github.com/username/gifdoc/workflows/CI%2FCD%20Pipeline/badge.svg)
![Demo Generation](https://github.com/username/gifdoc/workflows/Generate%20Demo%20GIFs/badge.svg)
```

---

## Cost Optimization

GitHub Actions is free for public repositories, with limits for private repositories:

- **Free tier:** 2,000 minutes/month for private repos
- **Cost:** ~$0.008/minute after free tier

### Reducing Workflow Minutes:

1. **Cache dependencies:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

2. **Limit workflow triggers:**
```yaml
paths:
  - 'demos/**'  # Only run when demos change
```

3. **Use smaller runners:**
```yaml
runs-on: ubuntu-latest  # Cheapest option
```

4. **Parallel jobs:** Run tests in parallel to reduce total time

---

## Future Enhancements

Planned workflow improvements:

- [ ] Matrix testing across Node.js versions (16, 18, 20)
- [ ] Browser matrix (Chromium, Firefox, WebKit)
- [ ] Performance benchmarking
- [ ] Automatic changelog generation
- [ ] Dependency vulnerability scanning
- [ ] Code coverage reporting
- [ ] Visual regression testing for GIFs
