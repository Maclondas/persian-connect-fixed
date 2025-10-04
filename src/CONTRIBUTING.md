# 🤝 Contributing to Persian Connect

Thank you for your interest in contributing to Persian Connect! This document provides guidelines and information for contributors.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and considerate in all interactions.

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Local Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/persian-connect.git
   cd persian-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

## 🔄 Development Workflow

### Branch Naming Convention
```bash
# Feature branches
feature/add-search-functionality
feature/improve-mobile-ui

# Bug fix branches
bugfix/fix-login-error
bugfix/correct-rtl-layout

# Documentation branches
docs/update-readme
docs/add-api-documentation
```

### Workflow Steps
1. Create a new branch from `main`
2. Make your changes
3. Test thoroughly (both languages, multiple devices)
4. Commit with descriptive messages
5. Push to your fork
6. Create a Pull Request

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new files
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Components
```tsx
// ✅ Good: Functional component with proper typing
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="bg-card p-4 rounded-lg">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
};
```

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the established design system
- Ensure RTL compatibility
- Test on multiple screen sizes

```tsx
// ✅ Good: Proper Tailwind usage with RTL support
<div className="flex items-center space-x-4 rtl:space-x-reverse">
  <span className="text-foreground">Name:</span>
  <input className="border rounded px-3 py-2" />
</div>
```

### File Organization
```
components/
├── ui/              # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom hooks
├── services/        # API and business logic
└── utils/           # Utility functions
```

## 📝 Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add social login with Google
fix(chat): resolve message timestamp display issue
docs(readme): update deployment instructions
style(components): improve button hover states
```

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows project standards
- [ ] All tests pass
- [ ] No console errors
- [ ] Tested on multiple browsers
- [ ] Tested both English and Persian
- [ ] Documentation updated if needed

### PR Requirements
1. **Clear Description**: Explain what the PR does and why
2. **Link Issues**: Reference related issues
3. **Screenshots**: Include before/after images for UI changes
4. **Testing**: Describe how you tested the changes
5. **Breaking Changes**: Clearly document any breaking changes

### Review Process
1. Automated checks must pass
2. At least one code review required
3. All feedback addressed
4. Final approval from maintainer

## 🐛 Issue Guidelines

### Before Creating an Issue
- Search existing issues to avoid duplicates
- Check if it's already fixed in the latest version
- Gather relevant information (browser, OS, steps to reproduce)

### Issue Types
- **Bug Report**: Something isn't working
- **Feature Request**: New functionality suggestion
- **Documentation**: Improvements to docs
- **Question**: General questions about usage

### Bug Report Template
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test core functionality
- [ ] Verify responsive design
- [ ] Check both language modes
- [ ] Test keyboard navigation
- [ ] Verify error handling
- [ ] Test payment flow (in test mode)

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Language Testing
- English (LTR layout)
- Persian (RTL layout)
- Language switching functionality

## 🌍 Internationalization

### Adding New Languages
1. Add language constants to language files
2. Update language picker component
3. Test RTL/LTR layout switching
4. Verify text direction and alignment

### Translation Guidelines
- Use clear, concise language
- Consider cultural context
- Test text length in different languages
- Ensure proper date/number formatting

## 🎨 Design Guidelines

### Color System
- **Primary**: `#0ac2af` (Teal) - Trust and reliability
- **Action**: `#dc2626` (Red) - CTAs and important actions
- **Accent**: `#000000` (Black) - Featured items and emphasis

### Typography
- Consistent font sizes using Tailwind tokens
- Proper line heights for readability
- Support for RTL text direction

### Responsive Design
- Mobile-first approach
- Test on various screen sizes
- Ensure touch targets are adequate
- Optimize for both portrait and landscape

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Tools
- [Figma](https://figma.com) - Design system reference
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing

## 🆘 Getting Help

### Communication Channels
- **GitHub Issues**: Technical problems and bugs
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code review and feedback

### Response Times
- Issues: Within 48 hours
- Pull Requests: Within 72 hours
- Critical bugs: Within 24 hours

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks in major releases

---

**Thank you for contributing to Persian Connect! 🎉**

Your contributions help build a better marketplace for the Persian community worldwide.