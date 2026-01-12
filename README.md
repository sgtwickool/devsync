# DevSync

A code snippet manager for organising and storing useful code snippets, boilerplate, and quick reference material. Built with Next.js 16 and PostgreSQL.

## Features

- Save code snippets with syntax highlighting for 21+ programming languages
- Organise snippets into collections for grouping related code
- Tag snippets for easy categorisation and discovery
- Full-text search across all snippets
- User authentication with private snippet storage
- Responsive design that works on desktop and mobile

## Tech Stack

- **Next.js 16** with App Router and Server Actions
- **TypeScript** for type safety
- **Prisma** for database management
- **NextAuth.js v5** for authentication
- **Tailwind CSS** for styling
- **CodeMirror 6** for syntax highlighting
- **PostgreSQL** for data storage

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sgtwickool/devsync.git
cd devsync
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="your-postgres-connection-string"
AUTH_SECRET="generate-a-random-secret-here"
```

Generate a secret key:
```bash
openssl rand -base64 32
```

**Important:** Use the same `AUTH_SECRET` across all devices/environments that share the same database. This ensures JWT sessions work across devices.

4. Set up your PostgreSQL database and add the connection string to `.env` as `DATABASE_URL`.

5. Initialise the database:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Create an account to get started.

## Project Structure

```
devsync/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main application (protected routes)
│   │   ├── snippets/      # Snippet management pages
│   │   └── collections/   # Collection management pages
│   └── api/               # API routes (NextAuth)
├── components/
│   ├── auth/              # Authentication forms
│   ├── snippets/          # Snippet-related components
│   ├── collections/       # Collection components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── actions/           # Server actions (CRUD operations)
│   ├── utils/             # Utility functions
│   ├── constants/         # Shared constants
│   └── types/             # TypeScript type definitions
└── prisma/
    └── schema.prisma      # Database schema
```

The codebase follows Next.js 16 conventions: server components by default, client components for interactivity. Server actions handle database operations.

## Development

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Making Schema Changes

The project uses Prisma for database management. To modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Prisma client will auto-regenerate

For production migrations, consider using `prisma migrate` instead of `db:push`.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
4. Deploy

Vercel will automatically deploy on every push to your main branch.

### Production Environment Variables

Set these in your hosting platform:

```env
DATABASE_URL="your-production-database-url"
AUTH_SECRET="use-a-different-secret-in-production"
```

## Current Features

- User authentication (email/password)
- Create, edit, and delete snippets
- Syntax highlighting for 21+ languages
- Collections for organising snippets
- Tags for categorisation
- Search functionality
- Responsive design

## Roadmap

- Public snippet sharing
- Team workspaces
- Dark mode
- Export snippets (markdown, PDF)
- VS Code extension
- API access

## Contributing

Issues and pull requests are welcome. Contributions that improve the codebase or add useful features are appreciated.

## License

MIT License - feel free to use this project for learning or building your own tools.

## Learning Resources

This project demonstrates:
- Server and client components in Next.js
- Server actions for mutations
- Authentication with NextAuth
- Database relationships with Prisma
- Form handling and validation
- Responsive UI with Tailwind CSS

See `GUIDE.md` for more detailed architecture notes.
