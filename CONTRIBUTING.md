# Contributing to WizLingo

Thank you for your interest in contributing to WizLingo! This guide will help you get started.

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch:** `git checkout -b feature/your-feature`
4. **Make changes** following the guidelines below
5. **Test thoroughly** with `npm run test && npm run lint`
6. **Push to your fork** and create a pull request

---

## 📋 Development Guidelines

### Code Quality

✅ **TypeScript:**
- Use strict mode (enforced in `tsconfig.json`)
- No `any` types unless absolutely necessary
- Proper type annotations for all functions

✅ **Naming Conventions:**
- Components: PascalCase (`UserDashboard.tsx`)
- Functions/variables: camelCase (`getUserData()`)
- Constants: UPPER_SNAKE_CASE (`MAX_ATTEMPTS = 5`)
- Files: kebab-case (`user-dashboard.tsx`)

✅ **Comments:**
- Only add comments for WHY, not WHAT
- Non-obvious logic needs JSDoc
- Link to relevant issues: `// See #123 for context`

✅ **Error Handling:**
- Always wrap API calls in try-catch
- Return meaningful error messages
- Log errors to console in development
- Use structured logging in production

✅ **Security:**
- Validate all user input (use Zod schemas)
- Rate limit endpoints if applicable
- Never log sensitive data
- Use environment variables for secrets

---

## 🧪 Testing

### Test Structure
```
tests/
├── unit/                    # Component & function tests
├── integration/             # API & database tests
└── e2e/                     # Full user workflow tests
```

### Writing Tests
```typescript
describe('FeedbackModal', () => {
  it('should submit feedback with rating', () => {
    // Arrange
    const { getByRole } = render(<FeedbackModal />);
    
    // Act
    fireEvent.click(getByRole('button', { name: /5 stars/i }));
    
    // Assert
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Running Tests
```bash
npm run test                # All tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

**Target:** >70% code coverage

---

## 🔄 Git Workflow

### Branch Naming
```
feature/add-sentry-logging    # New feature
fix/rate-limit-bypass         # Bug fix
docs/deployment-guide         # Documentation
refactor/reduce-api-payload   # Code cleanup
chore/upgrade-next            # Dependencies
```

### Commit Messages
```bash
# Good
git commit -m "Add Zod validation to feedback endpoint"
git commit -m "Fix OTP brute force vulnerability"
git commit -m "Update deployment docs for Railway"

# Avoid
git commit -m "fixes stuff"
git commit -m "updates"
git commit -m "WIP"
```

### Pull Request Process

1. **Before opening PR:**
   - [ ] Verify build: `npm run build` (0 errors)
   - [ ] Check tests: `npm run test` (all pass)
   - [ ] Check lint: `npm run lint` (no issues)

2. **PR Title Format:**
   ```
   [CATEGORY] Brief description under 70 chars
   
   [FEATURE] Add real-time feedback dashboard
   [FIX] Prevent OTP brute force attacks
   [DOCS] Update API documentation
   [REFACTOR] Simplify session creation logic
   ```

3. **PR Description Template:**
   ```markdown
   ## Summary
   Brief description of what this PR does

   ## Changes
   - Change 1
   - Change 2
   - Change 3

   ## Testing
   - [ ] Manual testing completed
   - [ ] Tests added/updated
   - [ ] No breaking changes

   ## Related
   Fixes #123
   Related to #456
   ```

4. **Code Review:**
   - Respond to review comments
   - Push additional commits (don't force-push)
   - Request re-review when ready
   - Squash if maintainer asks

---

## 🏗️ Architecture

### API Endpoints
```
app/api/[feature]/[action]/route.ts

Example:
app/api/feedback/route.ts          # POST /api/feedback
app/api/sessions/reading/route.ts  # POST /api/sessions/reading
```

### Component Structure
```
components/
├── [Feature]/
│   ├── [Component].tsx            # Main component
│   ├── [Component].module.css      # Styles
│   └── [Component].test.tsx        # Tests
```

### Database Schema
- All changes go through migrations: `npx prisma migrate dev --name description`
- Never modify `schema.prisma` without creating a migration
- Test migrations on fresh database: `npx prisma migrate reset`

---

## 🔐 Security Checklist

Before submitting a PR with changes to:

**API Endpoints:**
- [ ] Validate all inputs (use Zod schema)
- [ ] Check authentication/authorization
- [ ] Add rate limiting if needed
- [ ] Log security-relevant events
- [ ] Handle errors without exposing internals

**Database:**
- [ ] Use Prisma (prevents SQL injection)
- [ ] Add database indexes for lookups
- [ ] Encrypt sensitive fields
- [ ] Test cascading deletes

**Dependencies:**
- [ ] Check for known vulnerabilities: `npm audit`
- [ ] Update `.npmrc` if using private packages
- [ ] Pin versions for production stability

---

## 📝 Documentation

### Code Comments
```typescript
// Good: Explains WHY
const MAX_FAILED_ATTEMPTS = 3; // Prevents brute force attacks on OTP

// Avoid: Explains WHAT (code already does this)
const max = 3; // Set max to 3
```

### JSDoc for Public Functions
```typescript
/**
 * Validates student phone number format
 * @param phone - 10-digit Indian phone number (6-9 prefix)
 * @returns True if valid Indian phone format
 * @throws Error if phone is invalid
 * @example
 * validatePhone('9876543210') // true
 * validatePhone('1234567890') // false
 */
export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}
```

### README Updates
Update README.md if you:
- Add new environment variables
- Change development setup steps
- Add major new features
- Update deployment instructions

---

## 🐛 Bug Reports

Include:
- [ ] **Exact steps to reproduce**
- [ ] **Expected vs actual behavior**
- [ ] **Environment** (Node version, OS, browser if applicable)
- [ ] **Error logs/screenshots** if relevant
- [ ] **Browser console errors** for UI bugs

Example:
```
## Bug: OTP not sending to phone

### Steps to reproduce:
1. Go to /auth/phone-signup
2. Enter phone number: 9876543210
3. Click "Send OTP"
4. Wait 5 seconds

### Expected:
OTP should appear in console (dev) or be sent via SMS

### Actual:
Button shows loading for 10 seconds, then shows error "Network error"

### Environment:
- Node 18.17.0
- macOS 14.5
- Chrome 125
```

---

## 🎯 Development Priorities

### High Priority
- Security fixes (vulnerabilities, auth, validation)
- Critical bugs (crashes, data loss)
- Performance degradation

### Medium Priority
- New features for upcoming release
- Code quality improvements
- Documentation updates

### Low Priority
- Nice-to-have features
- Code style changes
- Dependency updates (non-critical)

---

## 📚 Resources

- **Code Overview:** See `CLAUDE.md` and `AGENTS.md`
- **Security:** See `SECURITY_FIXES.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Architecture:** See `PRODUCTION_READINESS_AUDIT.md`

---

## 🤔 Questions?

- **GitHub Discussions:** Use for feature ideas and questions
- **GitHub Issues:** Use for bugs and documentation requests
- **Email:** info@clevermindsglobalschool.com

---

**Thank you for contributing to WizLingo!** 🙏

