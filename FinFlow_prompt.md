# FinFlow Web Application - Antigravity Master Prompt

## 1. ROLE

You are an expert full-stack web developer, UI engineer, database architect, AI/ML engineer, and Figma-to-code implementation specialist.

Build **FinFlow** as a complete, production-structured, responsive **full-stack web application** based on the supplied FinFlow Figma design and the supplied project abstract.

This is a **web application**, not a native Android or iOS application.

The Figma design is the visual source of truth.

The project abstract is the functional source of truth.

Do not replace the supplied design with a generic finance dashboard.

---

# 2. PROJECT OBJECTIVE

Build an AI-powered personal finance web application that allows users to:

- Securely record income and expenses.
- Track daily financial transactions.
- Automatically categorize expenses using AI.
- Visualize financial information through interactive dashboards and charts.
- Analyze spending patterns.
- Predict future monthly expenses using Machine Learning.
- Track planned budgets.
- Alert users when they approach or exceed their budgets.
- Interact with an AI financial assistant using natural language.
- Receive personalized recommendations for saving money.
- Identify unnecessary expenses.
- Improve financial management.
- Track financial goals.

The supplied abstract explicitly describes these capabilities as the main purpose of the project.

---

# 3. SOURCE FILES

Use these project sources:

1. FinFlow Figma design
2. AI Personal Finance Assistant project abstract
3. FinFlow workflow and technical specification

Before implementing the UI, inspect the Figma design carefully.

Do not assume that generic finance-app UI patterns are equivalent to the Figma design.

---

# 4. CRITICAL DESIGN RULE

## Figma = Visual Source of Truth

Reproduce the Figma design as accurately as possible.

Preserve:

- Color palette
- Font family
- Font weights
- Font sizes
- Line heights
- Spacing
- Padding
- Margins
- Border radius
- Shadows
- Card dimensions
- Button dimensions
- Icon positioning
- Navigation structure
- Chart layout
- Transaction layout
- Typography hierarchy
- Page hierarchy
- Component hierarchy
- Responsive behavior implied by the design

Do not randomly introduce:

- New colors
- New fonts
- New gradients
- New UI styles
- Material UI styling
- Bootstrap styling
- Generic dashboard templates

If a value cannot be reliably extracted from the Figma file, create a design-token placeholder and keep it easy to update.

---

# 5. FIRST TASK: FIGMA AUDIT

Before writing application logic, analyze the Figma design.

Create a design inventory containing:

## Screens

Identify every screen/frame.

For each screen record:

- Screen name
- Purpose
- Navigation entry
- Navigation destination
- Main components
- Interactive elements
- Forms
- Charts
- Cards
- Lists
- Empty states
- Error states
- Loading states

## Design Tokens

Extract:

- Primary color
- Secondary color
- Accent colors
- Background colors
- Surface/card colors
- Text colors
- Muted text colors
- Border colors
- Success colors
- Warning colors
- Error colors
- Font family
- Font weights
- Heading sizes
- Body sizes
- Caption sizes
- Border radii
- Shadows
- Spacing values

Do not invent values if the Figma design provides them.

---

# 6. APPLICATION TYPE

Build:

**Responsive full-stack web application**

Target:

- Desktop
- Laptop
- Tablet
- Mobile browser

Do not build:

- Native Android app
- Native iOS app
- Flutter application
- React Native application

The application must work as a modern responsive website.

---

# 7. TECHNOLOGY STACK

## Frontend

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Recharts
- Lucide React

## Backend

Use:

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

## Database

Use:

- PostgreSQL

Supabase can be used for:

- PostgreSQL
- Authentication
- Storage if required

## Machine Learning

Use:

- Python
- Pandas
- NumPy
- Scikit-learn
- Joblib

## AI

Use an LLM API through the FastAPI backend.

Never expose an AI API key in frontend code.

## Development

Use:

- Git
- Docker
- Docker Compose
- Environment variables

---

# 8. APPLICATION ARCHITECTURE

Use this architecture:

```text
FinFlow
│
├── frontend
│   ├── pages
│   ├── components
│   ├── layouts
│   ├── hooks
│   ├── services
│   ├── api
│   ├── types
│   ├── utils
│   ├── assets
│   └── styles
│
├── backend
│   ├── api
│   ├── models
│   ├── schemas
│   ├── services
│   ├── repositories
│   ├── ml
│   ├── ai
│   ├── core
│   └── utils
│
├── database
│   ├── migrations
│   └── seed
│
├── tests
│
├── docs
│
└── docker-compose.yml
```

Maintain separation between:

- UI
- API
- business logic
- database
- AI
- ML

Do not place all application logic inside React components.

---

# 9. AUTHENTICATION

Implement secure authentication.

Required flow:

```text
Splash
   ↓
Onboarding
   ↓
Login / Sign Up
   ↓
Authentication
   ↓
Initial Setup
   ↓
Dashboard
```

Support:

- Registration
- Login
- Logout
- Session persistence
- Protected routes
- User profile
- Authentication errors
- Loading states

Every finance record must belong to the authenticated user.

A user must never be able to access another user's financial data.

---

# 10. MAIN NAVIGATION

Implement the navigation structure shown in the Figma design.

Core modules:

- Dashboard
- Transactions
- Budget
- Analytics
- AI Assistant
- Goals
- Notifications
- Profile / Settings

Do not change the navigation hierarchy unless the Figma design requires it.

---

# 11. DASHBOARD

Implement the dashboard shown in the Figma design.

The dashboard should provide financial information such as:

- Total balance
- Income
- Expenses
- Recent transactions
- Spending summary
- Budget status
- Financial insights
- Forecast information
- Goal progress where present in the design

All financial values must come from the backend/database.

Do not hardcode financial values in production.

Use development seed data only when required for testing or demonstration.

---

# 12. TRANSACTIONS

Implement complete transaction management.

Users must be able to:

- View transactions
- Add transaction
- Edit transaction
- Delete transaction
- Search transactions
- Filter transactions
- Sort transactions
- View transaction details

Transaction fields should support:

```text
id
user_id
type
amount
category_id
description
transaction_date
payment_method
created_at
updated_at
```

Transaction types:

- Income
- Expense

Categories should be configurable.

Example categories:

- Food
- Transport
- Shopping
- Bills
- Healthcare
- Education
- Entertainment
- Travel
- Other

---

# 13. AI EXPENSE CATEGORIZATION

Implement AI-based expense categorization.

Workflow:

```text
Transaction description
        ↓
Preprocessing
        ↓
AI/ML classifier
        ↓
Predicted category
        ↓
User confirmation
        ↓
Database
```

When a user enters a transaction without selecting a category:

1. Send relevant transaction information to the categorization service.
2. Predict the category.
3. Display the prediction.
4. Allow the user to change it.
5. Save the confirmed category.

Do not silently overwrite a user-selected category.

---

# 14. BUDGET MANAGEMENT

Implement:

- Monthly budget
- Category budgets
- Budget utilization
- Remaining budget
- Budget thresholds
- Budget warnings
- Budget exceeded alerts

Workflow:

```text
Create budget
      ↓
Record transactions
      ↓
Calculate spending
      ↓
Compare spending with budget
      ↓
Determine status
      ↓
Display alert/recommendation
```

Budget states:

- Normal
- Warning
- Near Limit
- Exceeded

Thresholds should be configurable.

---

# 15. ANALYTICS

Create interactive financial analytics.

Use real transaction data.

Include relevant visualizations from the Figma design.

Potential visualizations:

- Income vs expense
- Monthly spending
- Category spending
- Spending trend
- Budget utilization
- Savings trend
- Forecast vs actual

Use Recharts.

Charts must:

- Be responsive.
- Have meaningful labels.
- Display empty states.
- Handle loading states.
- Handle missing data.
- Use the Figma color palette.

Do not introduce arbitrary chart colors.

---

# 16. MACHINE LEARNING

Implement monthly expense prediction.

Workflow:

```text
Historical transactions
        ↓
Data preprocessing
        ↓
Feature engineering
        ↓
ML model
        ↓
Monthly expense prediction
        ↓
FastAPI prediction endpoint
        ↓
Frontend dashboard
```

Use:

- Pandas
- NumPy
- Scikit-learn
- Joblib

Do not claim a model is accurate without validation.

The model should return:

- Prediction
- Prediction period
- Relevant model information
- Error/confidence information when available

The implementation should make it possible to replace the model later without changing the frontend.

---

# 17. AI FINANCIAL ASSISTANT

Build the AI assistant as a secure backend-driven feature.

Workflow:

```text
User message
     ↓
FastAPI
     ↓
Authenticated user verification
     ↓
Retrieve user's financial context
     ↓
Retrieve relevant transactions
     ↓
Retrieve budgets
     ↓
Retrieve goals
     ↓
Construct restricted AI context
     ↓
LLM
     ↓
Response validation
     ↓
Frontend
```

The assistant should support:

- Saving recommendations
- Expense reduction suggestions
- Spending analysis
- Budget guidance
- Financial explanations
- Goal guidance
- Natural-language finance questions

The AI assistant must only access the authenticated user's permitted financial information.

Never send unrelated users' data to the AI model.

Never expose provider API keys in the browser.

Store conversations securely.

---

# 18. FINANCIAL GOALS

Implement financial goals.

Each goal can contain:

```text
id
user_id
name
target_amount
current_amount
target_date
created_at
updated_at
```

Support:

- Create goal
- Edit goal
- Delete goal
- Progress tracking
- Remaining amount
- Target date
- Required saving estimate
- Goal recommendations

Display progress using the visual style of the Figma design.

---

# 19. NOTIFICATIONS

Implement in-app notifications.

Notification triggers can include:

- Budget near limit
- Budget exceeded
- High predicted spending
- Goal milestone

Notification structure:

```text
id
user_id
type
title
message
read
created_at
```

Support:

- View notifications
- Mark as read
- Unread count

---

# 20. DATABASE

Create a normalized PostgreSQL database.

Core tables:

```text
users
profiles
categories
transactions
budgets
budget_categories
financial_goals
notifications
ai_conversations
ai_messages
ml_predictions
```

Use:

- Primary keys
- Foreign keys
- Indexes
- Constraints
- Timestamps
- User ownership checks

Create database migrations.

Do not rely on manually created production tables.

---

# 21. API DESIGN

Create REST APIs.

Suggested routes:

```text
/api/auth
/api/users
/api/transactions
/api/categories
/api/budgets
/api/analytics
/api/goals
/api/notifications
/api/forecast
/api/ai
```

Transaction endpoints:

```text
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/{id}
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
```

Analytics:

```text
GET /api/analytics/summary
GET /api/analytics/spending
GET /api/analytics/categories
```

Budget:

```text
GET  /api/budgets
POST /api/budgets
GET  /api/budgets/{id}
PUT  /api/budgets/{id}
```

Goals:

```text
GET    /api/goals
POST   /api/goals
GET    /api/goals/{id}
PUT    /api/goals/{id}
DELETE /api/goals/{id}
```

Forecast:

```text
POST /api/forecast/monthly
```

AI:

```text
POST /api/ai/chat
GET  /api/ai/conversations
```

Notifications:

```text
GET /api/notifications
PUT /api/notifications/{id}/read
```

Use Pydantic schemas for request and response validation.

---

# 22. FRONTEND STATE

Use TanStack Query for server state.

Use React state/context only for appropriate local or application state.

Do not duplicate backend data unnecessarily.

Handle:

- Loading
- Success
- Error
- Empty
- Retry

for API-driven screens.

---

# 23. FORM VALIDATION

Use:

- React Hook Form
- Zod

Validate:

- Amount
- Transaction type
- Category
- Description
- Dates
- Budget values
- Goal values
- Authentication fields

Show validation errors in the same visual style as the Figma design.

---

# 24. RESPONSIVE DESIGN

The application must work across:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Do not simply scale desktop UI down.

Adapt:

- Navigation
- Cards
- Charts
- Tables
- Forms
- Modals
- Transaction lists
- Dashboard grids

Preserve the Figma visual hierarchy at every breakpoint.

---

# 25. DESIGN SYSTEM IMPLEMENTATION

Create reusable components instead of duplicating markup.

At minimum:

```text
Button
Input
Select
Modal
Card
Badge
Avatar
Navigation
BottomNavigation
Header
TransactionCard
TransactionList
BudgetCard
GoalCard
ChartCard
StatCard
NotificationItem
EmptyState
LoadingState
ErrorState
AIChat
```

Components must use shared design tokens.

Do not create separate one-off styling for every screen when the component is reusable.

---

# 26. COLOR AND TYPOGRAPHY

Extract the exact Figma values before implementation.

Create centralized design tokens.

Example structure:

```text
colors:
  primary
  secondary
  accent
  background
  surface
  text
  muted
  border
  success
  warning
  error

typography:
  fontFamily
  heading
  subheading
  body
  caption
  button
```

Do not use placeholder colors after the Figma audit is complete.

Do not substitute the Figma font with another font without a documented reason.

---

# 27. ICONS AND ASSETS

Use the closest available icons only when the Figma asset cannot be directly reused.

Prefer:

- Existing Figma assets
- Existing project assets
- Lucide React where appropriate

Maintain:

- Icon size
- Stroke weight
- Alignment
- Spacing

Do not add decorative icons that are not present in the design unless functionally necessary.

---

# 28. SECURITY

Implement:

- Authentication
- Authorization
- User ownership checks
- Secure API routes
- Environment variables
- Backend-only AI keys
- Input validation
- SQL injection protection through ORM/query parameters
- CORS configuration
- Secure error handling

Never expose:

```text
DATABASE_PASSWORD
JWT_SECRET
AI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

in frontend source code.

---

# 29. ERROR HANDLING

Every API-driven feature must have:

- Loading state
- Empty state
- Error state
- Retry behavior where appropriate

Do not display raw backend exceptions to users.

Log detailed errors on the server.

Display concise user-facing errors.

---

# 30. DEMO DATA

Create seed data for development.

Seed data should include:

- Sample income
- Sample expenses
- Multiple categories
- Sample monthly budget
- Sample goals
- Sample notifications
- Sample historical transactions for ML testing

Clearly separate seed/demo data from real user data.

---

# 31. DEVELOPMENT ORDER

Implement in this exact sequence:

```text
1. Figma Audit
        ↓
2. Design Tokens
        ↓
3. Project Architecture
        ↓
4. Reusable Components
        ↓
5. Authentication
        ↓
6. Dashboard
        ↓
7. Transactions
        ↓
8. Budget
        ↓
9. Analytics
        ↓
10. Goals
        ↓
11. AI Categorization
        ↓
12. ML Forecasting
        ↓
13. AI Financial Assistant
        ↓
14. Notifications
        ↓
15. Testing
        ↓
16. Responsive Refinement
        ↓
17. Production Build
```

Do not attempt to implement every feature simultaneously.

After each major module:

1. Build.
2. Test.
3. Fix errors.
4. Verify UI against Figma.
5. Continue to the next module.

---

# 32. CODE QUALITY

Follow these rules:

- Use TypeScript types.
- Avoid `any` unless absolutely necessary.
- Use reusable components.
- Keep business logic outside UI components.
- Keep API calls in service/API modules.
- Keep database operations in repository/service layers.
- Use environment variables.
- Add comments only where they clarify non-obvious logic.
- Do not create unnecessary abstraction.
- Do not duplicate code.
- Keep functions focused.
- Use meaningful names.

---

# 33. TESTING

Create tests for:

## Frontend

- Authentication flow
- Transaction forms
- Transaction rendering
- Budget calculations
- Goal calculations
- API error states

## Backend

- Authentication
- Authorization
- Transaction CRUD
- Budget calculations
- Analytics
- Forecast endpoint
- AI endpoint
- Notification access

## Security

Verify that:

```text
User A cannot access User B's transactions.
User A cannot modify User B's budget.
User A cannot access User B's goals.
User A cannot access User B's AI conversation.
```

---

# 34. FINAL UI VERIFICATION

Before declaring the project complete, compare the implementation against the Figma design screen by screen.

Verify:

- Colors
- Fonts
- Typography
- Spacing
- Alignment
- Component sizes
- Icons
- Cards
- Charts
- Navigation
- Forms
- Buttons
- Responsive behavior

Do not declare visual completion based only on functional correctness.

---

# 35. FINAL ACCEPTANCE CRITERIA

The application is complete only when:

- Every Figma screen is implemented.
- Navigation works.
- Authentication works.
- User data is isolated.
- Transactions work.
- AI categorization works.
- Dashboard uses real database data.
- Analytics use real transaction data.
- Budgets work.
- Budget alerts work.
- ML monthly expense prediction works.
- AI financial assistant works through the backend.
- Goals work.
- Notifications work.
- Responsive design works.
- Figma colors are preserved.
- Figma fonts are preserved.
- Figma component structure is preserved.
- No financial values are hardcoded in production.
- No secret keys are exposed.
- Database migrations work.
- Backend APIs are validated.
- Core tests pass.
- Production build succeeds.

---

# 36. IMPORTANT ANTIGRAVITY BEHAVIOR

Do not generate a fake frontend with static screens only.

The result must be a functioning full-stack application.

Do not hardcode dashboard numbers and pretend they are database-driven.

Do not create fake AI responses when the AI service is configured.

Do not create fake ML predictions when the prediction service is configured.

Use mock/seed data only during development when real data is unavailable.

Do not redesign the Figma interface.

Do not replace the FinFlow color palette.

Do not replace the FinFlow typography.

Do not replace the Figma navigation structure.

Do not remove features from the supplied design.

If a feature is visually represented in Figma, implement the corresponding interaction.

If a backend feature is defined by the abstract but not visibly represented in Figma, implement it in the appropriate existing FinFlow screen without changing the established visual language.

Build the application incrementally and keep the project runnable after every phase.

The final result must be a responsive, functional, secure, AI-enabled personal finance web application called **FinFlow**.
