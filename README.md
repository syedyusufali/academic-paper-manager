# Academic Paper Manager

A comprehensive web application for managing academic papers, tracking progress, setting milestones, and organizing research notes.

## Features

- **Dashboard**: Overview with statistics, recent activity, and quick actions
- **Paper Management**: Create, edit, and track academic papers with word count goals
- **Timeline View**: Chronological view of papers and milestones with due dates
- **Milestone Tracking**: Set and track important deadlines with urgency indicators
- **Note Organization**: Take and organize research notes by paper and section
- **Progress Tracking**: Log daily writing progress with word counts and time spent
- **Progress Visualization**: Interactive charts showing weekly writing productivity

## Tech Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js with Express.js
- **Database**: In-memory storage (easily replaceable with PostgreSQL)
- **Build Tool**: Vite for development and production builds
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd academic-paper-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

The development server will automatically restart when you make changes to the code.

## Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

The built application will be served from the `dist` directory.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions and configurations
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface and implementation
│   └── vite.ts             # Vite integration for development
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and validation
└── dist/                   # Production build output (generated)
```

## Database Configuration

The application currently uses in-memory storage for simplicity. To use a persistent database:

1. **Install a database driver (e.g., for PostgreSQL):**
   ```bash
   npm install pg @types/pg
   ```

2. **Update the storage implementation** in `server/storage.ts`

3. **Set up environment variables** for database connection

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Sync database schema (when using persistent DB)

## Environment Variables

Create a `.env` file in the root directory for configuration:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url_here  # Optional, for persistent storage
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.