# Academic Paper Manager

## Overview

The Academic Paper Manager is a full-stack web application designed to help users manage academic papers, track progress, set milestones, and organize research notes. The application provides a comprehensive dashboard for academic writing workflow management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request logging
- **Development**: Hot module replacement via Vite integration

### Database Layer
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Type Safety**: Generated TypeScript types from database schema

## Key Components

### Database Schema
The application uses four main entities:
- **Papers**: Core academic papers with title, category, word count tracking, status, and due dates
- **Milestones**: Task-based milestones linked to papers with completion tracking
- **Notes**: Research notes organized by paper and section
- **Progress Entries**: Daily progress tracking with word count and time spent

### API Endpoints
- **Papers**: CRUD operations for academic papers (`/api/papers`)
- **Milestones**: Milestone management with completion tracking (`/api/milestones`)
- **Notes**: Note-taking system with section categorization (`/api/notes`)
- **Progress**: Progress tracking and analytics (`/api/progress`)
- **Dashboard**: Aggregated statistics and overview data (`/api/dashboard/stats`)

### Frontend Pages
- **Dashboard**: Overview with statistics, recent papers, and quick actions
- **Papers**: Paper listing with filtering and search capabilities
- **Paper Detail**: Individual paper management with tabs for milestones, notes, and progress
- **Timeline**: Chronological view of papers and milestones
- **Milestones**: Milestone management across all papers
- **Notes**: Note organization and management
- **Progress**: Progress tracking and visualization

### UI Components
- **Responsive Design**: Mobile-first approach with desktop sidebar and mobile bottom navigation
- **Component Library**: Extensive use of shadcn/ui components for consistency
- **Form Handling**: Reusable dialog components for creating papers, milestones, and progress entries
- **Data Visualization**: Progress charts and statistics displays

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Layer**: Express.js routes handle requests with validation via Zod schemas
3. **Storage Interface**: Abstract storage interface allows for different implementations
4. **Database Operations**: Drizzle ORM handles PostgreSQL operations with type safety
5. **Response Handling**: Standardized JSON responses with proper error handling
6. **Client Updates**: TanStack Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **UI Components**: Radix UI primitives via shadcn/ui
- **Form Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development Tools**: tsx for development server, Replit-specific plugins

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Hot module replacement with Vite middleware
- **Production**: Static file serving with Express
- **Database**: Environment variable-based configuration (`DATABASE_URL`)

### Scripts
- `dev`: Development server with hot reloading
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Database schema synchronization

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```