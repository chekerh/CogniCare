# Contributing to Cognicare

Thank you for your interest in contributing to Cognicare! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/cognicare.git
   cd cognicare
   ```

3. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up the project:**
   ```bash
   npm install
   cp .env.example .env
   # Add your Supabase credentials to .env
   ```

5. **Make your changes**

6. **Test your changes:**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

7. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

8. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Open a Pull Request**

## Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example:
```
feat: add progress dashboard for children
fix: resolve messaging encryption issue
docs: update database setup guide
```

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Request review from maintainers
4. Address any feedback
5. Wait for approval before merging

## Development Guidelines

- Write clean, maintainable code
- Add error handling
- Consider accessibility (ARIA labels, keyboard navigation)
- Support RTL for Arabic
- Test on multiple browsers
- Follow security best practices

## Questions?

Open an issue or contact the maintainers.

Thank you for contributing! 🎉

