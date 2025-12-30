# Kiwi Challenge Constitution

## Core Principles

### I. React-First Frontend
The frontend MUST be built with React. All UI components should be:
- Reusable and decoupled from business logic
- Following React best practices (hooks, functional components)
- Faithful to the provided Figma design
- Managing state appropriately (local vs global based on scope)

### II. API-Driven Backend
The backend MUST expose a RESTful API that:
- Is completely decoupled from the frontend
- Provides endpoints for all required operations (CRUD)
- Implements server-side validation for all inputs
- Returns consistent error responses with appropriate HTTP status codes
- Documents all endpoints clearly

### III. Flexible Persistence
Data persistence is flexible and can use:
- Relational databases (PostgreSQL, SQLite)
- NoSQL databases (MongoDB)
- File-based storage (JSON files)

Regardless of choice, the implementation MUST:
- Have a clear and documented data schema
- Support all CRUD operations for domain entities
- Maintain data integrity

### IV. Pragmatic Testing
Testing is required but not strictly TDD:
- Unit tests for critical business logic
- Component tests for main React components
- API endpoint tests for backend routes
- Focus on meaningful test coverage over 100% coverage

### V. SOLID & Clean Code
All code MUST follow SOLID principles and clean code practices:
- **Single Responsibility**: Each class/function does one thing well
- **Open/Closed**: Code is extensible without modifying existing code
- **Liskov Substitution**: Subtypes are interchangeable with their base types
- **Interface Segregation**: Small, specific interfaces over large general ones
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

Additionally:
- Code is readable and self-documenting
- Functions and variables have meaningful names
- Project structure is clear and scalable
- Commits are consistent and descriptive (conventional commits recommended)

## Domain Model

### Entities
The application manages the following core entities:

1. **User**: The rewards account holder
   - Has accumulated rewards balance
   - Has associated withdrawal methods
   - Has transaction history

2. **Transaction**: A record of balance changes
   - Types: cashback, referral_bonus, withdrawal
   - Has amount (positive for credits, negative for debits)
   - Has timestamp and description

3. **WithdrawalMethod**: A linked bank account for withdrawals
   - Associated with a user
   - Has account number (masked for display)
   - Has account type identifier

4. **Withdrawal**: A request to transfer funds
   - References a withdrawal method
   - Has amount and status (pending, processing, completed, failed)
   - Has timestamps for creation and completion

## Technology Stack

### Required
- **Frontend**: React (any version 17+)

### Flexible (candidate's choice)
- **Backend**: Node.js/Express, Python/FastAPI, Go, or any other
- **Database**: PostgreSQL, SQLite, MongoDB, or JSON file storage
- **State Management**: React Context, Redux, Zustand, or built-in useState
- **Styling**: CSS Modules, Tailwind, Styled Components, or plain CSS

## UX Requirements

The application MUST provide good user experience through:
- Loading states during async operations
- Clear error messages for user-facing errors
- Visual feedback for user actions (button states, transitions)
- Responsive design following the Figma specifications

## Governance

This constitution serves as a **guide** for the challenge, not a strict blocker. The focus is on:
- Demonstrating understanding of the principles
- Delivering a complete, working flow
- Making reasonable technical decisions

Candidates should document any deviations or assumptions in their README.

**Version**: 1.0.0 | **Ratified**: 2025-12-30
