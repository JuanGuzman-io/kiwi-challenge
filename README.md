# Kiwi Challenge

A technical challenge to build a **Rewards/Cashback application** using [GitHub Spec-Kit](https://github.com/github/spec-kit).

## What's Already Configured

The project constitution has been set up at `.specify/memory/constitution.md` (v2.0.0) with the following core principles:

1. **Production-Grade Engineering** - Clean code, SOLID principles, maintainable by new developers
2. **React Frontend Architecture** - Feature-based architecture, custom components, WCAG 2.1 AA compliance
3. **NestJS Backend Architecture** - Hexagonal architecture, Prisma ORM, PostgreSQL database
4. **Mandatory Testing Discipline** - 85%+ coverage for services, integration tests, e2e tests

## The Challenge

Build a Rewards application based on the Figma design that allows users to:
- View their accumulated rewards balance
- See transaction history (cashback, referral bonuses, withdrawals)
- Withdraw funds to a linked bank account

### Resources

- [Full Challenge Instructions (Notion)](https://eslavadev.notion.site/Test-Kiwi-2c3156058be680b0964cebac1f3cf865)
- [Figma Design](https://www.figma.com/design/A2GHMXbAIUTtmW9b7kQH7V/Prueba-T%C3%A9cnica?node-id=0-1&p=f&t=MYhwBI3i0D9vVyrk-0)

## What You Need to Do

Follow the Spec-Kit workflow to plan and implement the application:

### 1. Create the Specification
```bash
/speckit.specify
```
Describe the feature based on the Figma design. The tool will help you create a detailed specification.

### 2. Clarify Requirements (Optional)
```bash
/speckit.clarify
```
If there are ambiguities, use this to refine the specification.

### 3. Create the Implementation Plan
```bash
/speckit.plan
```
Design the technical approach, data models, and API contracts.

### 4. Generate Tasks
```bash
/speckit.tasks
```
Break down the plan into actionable, dependency-ordered tasks.

### 5. Implement
```bash
/speckit.implement
```
Execute the tasks to build the application.

### 6. Analyze (Optional)
```bash
/speckit.analyze
```
Validate consistency across all artifacts.

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

### Architectural Requirements
- **Frontend**: Feature-based architecture (max 3 levels nesting per feature)
- **Backend**: Hexagonal (ports and adapters) architecture
- **No UI component libraries** (e.g., MUI, Ant Design) - build custom components
- **Accessibility**: WCAG 2.1 AA compliance mandatory

## Evaluation Criteria

- **Design Fidelity**: Match the Figma design with responsive breakpoints
- **Code Quality**: Cleanliness, SOLID principles, cohesion, modularity, readability
- **Architecture**: Feature-based frontend, hexagonal backend, clear separation of concerns
- **Testing**: 85%+ unit test coverage for services, integration tests, e2e tests
- **API Documentation**: Complete Swagger documentation on all endpoints
- **UX Excellence**: Loading states, error handling, micro-interactions, WCAG 2.1 AA compliance
- **Spec-Kit Usage**: Complete artifacts (spec.md, plan.md, tasks.md) for both frontend and backend
- **Project Structure**: Feature-based frontend, proper NestJS module organization

## Deliverables

1. Public repository (or private with access granted) containing:
   - Frontend code
   - Backend code
   - All Spec-Kit artifacts (spec.md, plan.md, tasks.md)

2. Updated README with:
   - Brief explanation of your technical approach
   - Architectural decisions
   - Setup and run instructions
   - Any assumptions made

## Getting Started

```bash
# Clone the repository
git clone <your-fork-url>
cd kiwi-challenge

# Start working with Spec-Kit
# Run /speckit.specify to begin
```

## Estimated Time

1-3 hours recommended, but quality over speed is preferred.

---

Good luck!
