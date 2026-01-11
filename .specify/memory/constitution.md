<!--
  Sync Impact Report
  ==================
  Version Change: 1.1.0 → 2.0.0

  Modified Principles:
  - Principle I: "React-First Frontend" → "Production-Grade Engineering" (redefined from
    frontend-specific to global principle)
  - Principle II: "API-Driven Backend" → "React Frontend Architecture" (narrowed scope,
    added comprehensive React-specific rules)
  - Principle III: "Flexible Persistence" → "NestJS Backend Architecture" (eliminated
    flexibility, mandated specific stack: NestJS + Prisma + PostgreSQL)
  - Principle IV: "Pragmatic Testing" → "Mandatory Testing Discipline" (strengthened
    from flexible to mandatory 85%+ coverage requirements)
  - Principle V: "SOLID & Clean Code" → remains but moved to Principle I context

  Added Sections:
  - "Global Principles" supersection covering all tiers
  - "Client (React) Rules" with Architecture, UX Requirements, and Non-Negotiables
  - "Server (NestJS) Rules" with Architecture, Coding Standards, Patterns, and Testing
  - "Technology Stack" section now prescriptive (not flexible)
  - "Testing Requirements" elevated to principle-level with specific coverage mandates

  Removed Sections:
  - "Flexible (candidate's choice)" options eliminated - stack is now prescribed
  - "Actual Implementation Choices" removed (stack is now mandatory, not example)

  Templates Status:
  ⚠ .specify/templates/plan-template.md - Constitution Check will need validation
     against new mandatory requirements (NestJS, Prisma, PostgreSQL, 85% coverage)
  ⚠ .specify/templates/spec-template.md - Requirements sections should reference new
     testing mandates and architecture constraints
  ⚠ .specify/templates/tasks-template.md - Task categories must include Swagger
     documentation, Prisma migrations, unit/integration/e2e test phases
  ✅ .specify/templates/agent-file-template.md - Generic template, compatible
  ✅ .specify/templates/checklist-template.md - Generic template, compatible
  ⚠ README.md - Should be updated to reflect mandatory stack (NestJS, Prisma,
     PostgreSQL) and testing requirements (85%+ coverage)

  Version Bump Rationale:
  MAJOR version bump (1.1.0 → 2.0.0) because:
  - BACKWARD INCOMPATIBLE: Eliminated flexibility in backend stack (now NestJS only)
  - BACKWARD INCOMPATIBLE: Database choice eliminated (now PostgreSQL + Prisma only)
  - BACKWARD INCOMPATIBLE: Testing changed from "pragmatic" to mandatory 85%+ coverage
  - BACKWARD INCOMPATIBLE: Added prescriptive architecture (hexagonal for backend,
    feature-based for frontend)
  - BREAKING: Previous "flexible persistence" principle redefined with hard requirements
  - BREAKING: Added non-negotiable restrictions (no UI libraries, WCAG 2.1 AA mandatory)
  - Redefined scope: from flexible challenge guide to production-grade requirements

  Follow-up TODOs:
  - Update README.md to remove "flexible backend choice" language and emphasize
    mandatory NestJS + Prisma + PostgreSQL stack
  - Review plan-template.md Constitution Check gates to validate against new mandatory
    architecture patterns (hexagonal backend, feature-based frontend)
  - Consider adding example tasks in tasks-template.md for Swagger setup, Prisma
    migrations, and test harness configuration
-->

# Kiwi Challenge Constitution

## Global Principles

### I. Production-Grade Engineering
Build a production-grade application with clean code, strong engineering practices, and
SOLID principles.

**Requirements**:
- Prefer high cohesion, clear boundaries, and modular design over cleverness
- Keep dependencies minimal and intentional; avoid adding libraries unless they clearly
  reduce complexity
- Ensure high code quality: cleanliness, consistent patterns, cohesion, modularity, and
  readability
- All Controllers, Services, and Modules MUST have unit tests (at minimum where
  applicable)
- All code MUST be maintainable by a new developer with minimal onboarding

**SOLID Principles** (mandatory):
- **Single Responsibility**: Each class/function does one thing well. One service equals
  one responsibility.
- **Open/Closed**: Code is extensible without modifying existing code
- **Liskov Substitution**: Subtypes are interchangeable with their base types
- **Interface Segregation**: Small, specific interfaces over large general ones
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

**Rationale**: Production systems require maintainable, testable code. SOLID principles
ensure the codebase scales with team growth and evolving requirements.

### II. React Frontend Architecture
The frontend MUST be built with React following modern best practices and a feature-based
architecture.

**Architecture & Structure**:
- Responsive design is MANDATORY across common breakpoints (mobile to desktop)
- MUST use a feature-based architecture (group code by feature, not by technical layer)
- Reusable UI components MUST be extracted to shared locations when used across features
- Limit folder nesting to a maximum of 3 levels per feature
- MUST use custom hooks for reusable UI logic and stateful behaviors

**UX Requirements**:
- MUST provide clear user feedback for all async operations (loading, success, error)
- MUST use loaders or skeletons where appropriate to avoid blank states
- SHOULD add micro-interactions where they improve clarity (e.g., disabled states, subtle
  transitions), without over-engineering

**Non-Negotiables (Restrictions)**:
- DO NOT use full UI component libraries (e.g., MUI, Ant Design). Build custom components.
- DO NOT implement premature optimizations or future-proofing
- Avoid unnecessary abstractions; use React directly and keep patterns simple
- Per feature, DO NOT introduce more than 3 major dependencies or projects
- Accessibility is MANDATORY: at least WCAG 2.1 AA compliance

**Rationale**: Feature-based architecture keeps related code together, reducing cognitive
load. Custom components ensure design fidelity and lightweight bundles. WCAG 2.1 AA
compliance is a baseline legal and ethical requirement.

### III. NestJS Backend Architecture
The backend MUST be built with NestJS following hexagonal (ports and adapters)
architecture with clear separation of concerns.

**Architecture & Tooling**:
- MUST follow hexagonal (ports and adapters) architecture with clear separation between
  domain, application, and infrastructure concerns
- MUST document the API using Swagger on controllers (endpoints, DTOs, responses, and
  error cases)
- MUST validate and handle errors consistently; add logging in services for key
  operations and failures
- MUST use Prisma ORM for database access
- MUST use PostgreSQL as the primary database

**Coding Standards**:
- MUST use NestJS CLI to generate modules (e.g., `nest g module users`)
- DTOs are MANDATORY for all endpoint inputs and outputs
- MUST apply class-validator decorators on all DTOs; validate every request payload
- Controllers MUST contain HTTP-only logic (status codes, headers, request and response
  mapping)
- Services MUST contain all business logic
- NO default exports; use named exports only
- MUST use constructor-based dependency injection

**Patterns & Restrictions**:
- Single Responsibility Principle: one service equals one responsibility
- MUST avoid N+1 queries; use Prisma include or eager loading when needed
- MUST use Guards for authentication and authorization; DO NOT place auth logic in
  controllers
- MUST use Interceptors for global response transformation and serialization concerns
- MUST use Exception Filters for consistent error handling across the API
- Avoid tight coupling between modules; prefer events (EventEmitter) or message queues
  for cross-module communication

**Rationale**: Hexagonal architecture isolates business logic from infrastructure. Prisma
provides type-safe database access. Swagger ensures API discoverability. NestJS patterns
(Guards, Interceptors, Filters) enforce separation of concerns.

### IV. Mandatory Testing Discipline
Testing is MANDATORY with specific coverage requirements and test levels.

**Required Test Levels**:
- Unit tests for all services with MORE THAN 85% coverage
- Integration tests for critical controllers
- End-to-end tests for complete user flows

**Testing Guidelines**:
- MUST mock dependencies using NestJS testing providers
- Avoid over-mocking Prisma; prefer a dedicated test database for realistic behavior
- Component tests MUST cover main React components
- Tests MUST validate both happy paths and error scenarios

**Rationale**: 85%+ coverage ensures core logic is protected. Integration and e2e tests
catch architectural issues. Dedicated test databases prevent false positives from mocks.

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

### Frontend (Mandatory)
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.9.3
- **Compiler**: SWC
- **Linting**: ESLint

### Backend (Mandatory)
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest 29.7.0
- **API Documentation**: Swagger (via NestJS decorators)

### Code Quality Tools
- ESLint for linting
- Prettier for formatting (optional but recommended)
- Conventional Commits for commit messages (recommended)

**Rationale**: This stack provides type safety (TypeScript), fast builds (Vite/SWC),
production-ready patterns (NestJS), and reliable persistence (PostgreSQL + Prisma). All
tools are industry-standard with strong community support.

## UX Requirements

The application MUST provide excellent user experience through:
- Loading states during async operations
- Clear error messages for user-facing errors
- Visual feedback for user actions (button states, transitions)
- Responsive design following the Figma specifications
- WCAG 2.1 AA accessibility compliance

## Governance

### Purpose & Scope
This constitution defines **mandatory requirements** for the Kiwi Challenge. All
implementations MUST comply with these principles. Deviations require explicit
justification and documentation in the project README.

### Amendment Procedure
This constitution may be amended when:
- Core principles require clarification or expansion
- New technology constraints or requirements emerge
- Domain model evolves to support additional features
- Governance procedures need refinement

Amendments follow semantic versioning:
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Versioning Policy
Each amendment MUST:
- Update the version number according to semantic versioning rules
- Update the Last Amended date to the date of amendment (ISO 8601: YYYY-MM-DD)
- Document changes in a Sync Impact Report (as HTML comment at file top)
- Validate consistency with dependent templates and documentation

### Compliance Review
Projects using this constitution MUST:
- Reference constitution principles in technical plans (plan.md)
- Validate implementations against core principles before feature completion
- Document ANY deviations with clear rationale in project README
- Maintain alignment between specs, plans, tasks, and constitution
- Include constitution version in project documentation for traceability

### Non-Compliance Consequences
Implementations that deviate from mandatory requirements without documented rationale may
be considered incomplete. Acceptable deviations include:
- Technical constraints of development environment (document in README)
- Time-boxed prototypes where certain requirements are explicitly deferred (document
  which principles are deferred and why)

**Version**: 2.0.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2026-01-10
