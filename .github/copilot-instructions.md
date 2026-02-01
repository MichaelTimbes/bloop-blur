# GitHub Copilot Instructions for Boop-Blur

## 📚 Required Reading

Before making any code changes, **always read** `FEATURES.md` in the project root. This file is the source of truth for all implemented functionality.

## 🔄 Feature Tracking Protocol

When adding, updating, or removing features, you **must** update `FEATURES.md`:

### When Adding New Features
1. Read `FEATURES.md` to understand existing functionality
2. Check if similar functionality already exists to avoid duplication
3. Implement the new feature
4. Update `FEATURES.md`:
   - Add checkbox item to **✅ Implemented Features** section
   - Document which files were created/modified
   - Update **📝 File Inventory** if new files were added
   - Add to **🏗️ Architecture Overview** if it changes data flow or component hierarchy
   - Update **🎨 Visual Design System** if new styles/tokens were added
   - Add any new dependencies to **📦 Dependencies**
   - Update timestamp at top of document

### When Modifying Existing Features
1. Read `FEATURES.md` to understand current implementation
2. Make code changes
3. Update `FEATURES.md`:
   - Modify feature description if behavior changed
   - Update file inventory if files were renamed/reorganized
   - Add note about what changed and why
   - Update timestamp

### When Removing Features
1. Remove or comment out code
2. Update `FEATURES.md`:
   - Move item from ✅ Implemented to 🚫 Not Implemented (or remove entirely)
   - Remove from file inventory
   - Update architecture diagrams if needed
   - Add note explaining why it was removed
   - Update timestamp

## 🚫 Prevention Rules

- **Never** overwrite existing functionality without explicit user request
- **Never** add features listed in "🚫 Not Implemented / Out of Scope" without discussion
- **Never** change core architecture decisions without noting it in FEATURES.md
- **Always** check if requested functionality already exists before building

## 📋 Pre-Implementation Checklist

Before writing code, verify:
- [ ] Read FEATURES.md completely
- [ ] Checked if feature/similar feature exists
- [ ] Understood current architecture and data flow
- [ ] Confirmed feature isn't in "out of scope" section
- [ ] Identified which files need modification
- [ ] Planned how to update FEATURES.md after implementation

## 🎯 Goal

Keep `FEATURES.md` as an accurate, up-to-date reflection of the codebase. It should always answer:
- What features exist?
- Where is each feature implemented?
- How do features connect to each other?
- What technical decisions were made and why?

**FEATURES.md is living documentation. Keep it alive.**
