# GitHub Workflows Summary

This document provides a quick reference for all GitHub Actions workflows in this project.

## 📋 Quick Reference

| Workflow | File | Triggers | Purpose |
|----------|------|----------|---------|
| **CI/CD Pipeline** | `ci.yml` | Push, PR, Manual | Build, test, and validate code |
| **Generate Demo GIFs** | `demo-generation.yml` | Push (demos), Manual | Generate and commit demo GIFs |
| **Release** | `release.yml` | Tags, Manual | Create releases and publish packages |

## 🎯 Common Use Cases

### I want to...

#### ...test my changes before merging
- **Workflow:** CI/CD Pipeline
- **How:** Runs automatically on every PR
- **What it does:** Builds, tests, and validates your code

#### ...update demo GIFs
- **Workflow:** Generate Demo GIFs
- **How:**
  - Automatic: Push changes to `demos/` directory
  - Manual: Actions → Generate Demo GIFs → Run workflow
- **What it does:** Generates new GIFs and commits them

#### ...create a new release
- **Workflow:** Release
- **How:**
  - Create and push a version tag: `git tag v1.0.0 && git push --tags`
  - Or: Actions → Release → Run workflow with version
- **What it does:** Creates GitHub release and prepares npm packages

#### ...test a specific demo
- **Workflow:** Generate Demo GIFs (manual)
- **How:** Actions → Generate Demo GIFs → Enter demo name
- **What it does:** Generates only that specific demo

## 🔄 Workflow Dependencies

```
┌─────────────────┐
│   Push/PR       │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    ┌────▼────┐      ┌────▼─────┐
    │   CI    │      │  Quality  │
    │  Build  │      │   Check   │
    └────┬────┘      └────┬──────┘
         │                │
         └────────┬───────┘
                  │
            ┌─────▼──────┐
            │  Test CLI  │
            └────────────┘
```

## 📊 Workflow Status

Check workflow status at: `https://github.com/yourusername/gifdoc/actions`

### Badge URLs

Add these to your README:

```markdown
![CI](https://github.com/yourusername/gifdoc/workflows/CI%2FCD%20Pipeline/badge.svg)
![Demo Generation](https://github.com/yourusername/gifdoc/workflows/Generate%20Demo%20GIFs/badge.svg)
![Release](https://github.com/yourusername/gifdoc/workflows/Release/badge.svg)
```

## ⚡ Performance Tips

### Speed Up Workflows

1. **Use caching:**
   - ✅ Already enabled: `cache: 'npm'` in Node.js setup
   - Saves ~30 seconds per workflow

2. **Skip unnecessary runs:**
   - Use `[skip ci]` in commit messages
   - Configure path filters in workflow triggers

3. **Parallel jobs:**
   - Quality checks run in parallel with builds
   - Reduces total workflow time

### Reduce Costs (Private Repos)

Current estimated usage per run:
- CI/CD Pipeline: ~2-3 minutes
- Demo Generation: ~3-5 minutes (depends on demos)
- Release: ~3-4 minutes

Monthly estimate (active development):
- ~50 CI runs = 150 minutes
- ~10 demo generations = 40 minutes
- ~2 releases = 8 minutes
- **Total: ~200 minutes/month** (well within free tier of 2,000 minutes)

## 🚨 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Workflow doesn't trigger | Check branch name, path filters, and permissions |
| Can't push commits | Enable "Read and write permissions" in Settings → Actions |
| Playwright fails | Ensure `npx playwright install --with-deps chromium` runs |
| Build fails | Check TypeScript errors with `npm run build --workspaces` |
| Artifacts missing | Verify path patterns in `upload-artifact` step |

### Debug Mode

Enable debug logging:
1. Go to Settings → Secrets and variables → Actions
2. Add repository variable: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow to see detailed logs

## 📈 Metrics and Monitoring

### What to Monitor

- **Success rate:** Should be >95%
- **Duration:** Track slow builds
- **Artifact sizes:** Watch for growing GIF sizes
- **Failure patterns:** Look for recurring issues

### GitHub Insights

View workflow analytics at:
- Repository → Insights → Actions

Shows:
- Workflow run times
- Success/failure rates
- Most active workflows

## 🔐 Security

### Secrets Used

| Secret | Used By | Purpose | Required |
|--------|---------|---------|----------|
| `GITHUB_TOKEN` | All workflows | Automated by GitHub | ✅ Yes |
| `NPM_TOKEN` | Release | Publish to npm | ⚠️ Optional |

### Security Best Practices

- ✅ Limited workflow permissions
- ✅ No secrets in logs
- ✅ Dependabot enabled for updates
- ✅ Branch protection recommended

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [Full Workflow Documentation](./WORKFLOWS.md)

---

**Last Updated:** 2026-01-28
**Maintained By:** GifDoc Team
