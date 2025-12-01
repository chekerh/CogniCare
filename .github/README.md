# Cognicare GitHub Repository

Welcome to the Cognicare repository! This directory contains GitHub-specific configuration files.

## Contents

- **workflows/** - GitHub Actions workflows
  - `ci.yml` - Continuous Integration (linting, type checking, building)
  - `deploy.yml` - Automated deployment to production

- **ISSUE_TEMPLATE/** - Issue templates
  - `bug_report.md` - Template for reporting bugs
  - `feature_request.md` - Template for feature requests

- **PULL_REQUEST_TEMPLATE.md** - Template for pull requests

## GitHub Actions

### CI Workflow
Runs on every push and pull request:
- Linting with ESLint
- Type checking with TypeScript
- Building the application

### Deploy Workflow
Runs on push to `main` or `master2`:
- Builds the application
- Deploys to Vercel (if configured)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions, please use the GitHub Issues tab.

