# DevSync

A modern, open-source code snippet manager with team collaboration built in. Organize your code snippets, share them with your team, and find them instantly with powerful full-text search.

## Features

- **Full-Text Search**: PostgreSQL-powered full-text search across titles, descriptions, code, and tags
- **Syntax Highlighting**: Beautiful code rendering with support for 100+ languages
- **Team Collaboration**: Share snippets with your team through organizations
- **Collections & Tags**: Organize snippets into logical groups
- **Secure & Private**: Your code stays yours. Self-host or use our cloud
- **Modern Stack**: Next.js 16, TypeScript, Prisma, PostgreSQL

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or use Supabase/Neon for free hosting)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
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

Edit `.env` and add:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devsync"
AUTH_SECRET="generate-with: openssl rand -base64 32"
GITHUB_CLIENT_ID="your-github-client-id"  # Optional
GITHUB_CLIENT_SECRET="your-github-client-secret"  # Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"  # For email invitations
EMAIL_ENABLED="true"  # Set to false to disable email in development
```

4. Set up the database:
```bash
# Deploy migrations (includes schema + full-text search)
npm run db:migrate:deploy

# Or for development, use:
npm run db:migrate
```

**Note**: The migrations include both the schema and full-text search setup. If you're starting fresh, migrations will run automatically. If you already have a database, see `PRISMA_MIGRATIONS.md` for setting up a baseline.

5. Start the development server:
```bash
npm run dev
```

6. Visit http://localhost:3000

## Database Setup

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Windows: Download from postgresql.org

# Create database
createdb devsync

# Connection string:
DATABASE_URL="postgresql://username@localhost:5432/devsync"
```

### Option B: Supabase (Recommended - Free & Easy)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" (transaction mode)
5. Replace password placeholder
6. Paste into `.env`

### Option C: Neon (Serverless PostgreSQL)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Paste into `.env`

## Full-Text Search Setup

DevSync uses PostgreSQL's full-text search for powerful snippet searching. The full-text search setup is included in the Prisma migrations and will be applied automatically when you run migrations.

The migration:
- Adds a `search_vector` generated column that combines title, description, code, and language
- Creates a GIN index for fast full-text search
- Enables prefix matching and relevance ranking
- Sets up tag name indexes for fast tag searching

**Note**: If you get an error about `pg_trgm` extension, the migration handles this automatically with `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

## Development

### Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production (includes Prisma generate)
npm run start            # Start production server
npm run vercel-build     # Build for Vercel (includes migrations)
npm run db:push          # Quick sync schema (development only)
npm run db:migrate       # Create and apply migration (development)
npm run db:migrate:deploy # Apply pending migrations (production)
npm run db:migrate:status # Check migration status
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration: `npm run db:migrate --name your_migration_name`
3. Prisma will generate the migration and apply it automatically
4. If you need custom SQL (like indexes or extensions), edit the generated migration file

**Development**: Use `npm run db:migrate` (creates and applies migration)
**Production**: Use `npm run db:migrate:deploy` (applies pending migrations only)

## Email Configuration

DevSync uses Resend for sending organization invitation emails. To enable email:

1. Sign up at https://resend.com
2. Get your API key
3. Add to `.env`:
```env
RESEND_API_KEY="re_..."
EMAIL_ENABLED="true"
```

In development, emails are only sent if `EMAIL_ENABLED=true`. In production, emails are always sent.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables (see `.env.example`)
4. Configure build command (see below)
5. Deploy

Vercel will automatically deploy on every push to your main branch.

### Production Database Setup

#### Step 1: Set up Production Database

1. Create a production Supabase project (or use your existing one)
2. Copy the production connection string
3. Add it to Vercel environment variables as `DATABASE_URL`

#### Step 2: Configure Automatic Migrations

**Option A: Using Vercel Build Command (Recommended)**

In Vercel project settings → Build & Development Settings, set:

**Build Command:**
```bash
npm run vercel-build
```

This will automatically:
- Generate Prisma client
- Deploy pending migrations
- Build the Next.js app

**Option B: Manual Migration (Alternative)**

If you prefer to run migrations manually:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Deploy migrations
npm run db:migrate:deploy
```

### Production Environment Variables

Set these in your hosting platform (Vercel):

```env
DATABASE_URL="your-production-database-url"
AUTH_SECRET="use-a-different-secret-in-production"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
RESEND_API_KEY="your-resend-api-key"
EMAIL_ENABLED="true"
```

### Production Deployment Checklist

- [ ] Production Supabase project created
- [ ] `DATABASE_URL` set in Vercel environment variables
- [ ] Build command configured to run migrations (or run manually)
- [ ] All other environment variables set in Vercel
- [ ] GitHub OAuth callback URL updated to production domain
- [ ] Test search functionality after deployment

**Note**: See `DEPLOYMENT.md` for detailed step-by-step instructions.

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── api/             # API routes
│   ├── dashboard/       # Main application pages
│   └── invite/          # Organization invite pages
├── components/
│   ├── auth/            # Authentication forms
│   ├── snippets/        # Snippet-related components
│   ├── collections/     # Collection components
│   ├── organizations/   # Organization components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── actions/         # Server actions (CRUD operations)
│   ├── utils/           # Utility functions
│   ├── constants/       # Shared constants
│   └── types/           # TypeScript type definitions
└── prisma/
    ├── schema.prisma    # Database schema
    └── migrations/      # SQL migrations
```

## Features

### Current Features

- ✅ User authentication (email/password and GitHub OAuth)
- ✅ Full-text search across snippets (title, description, code, language, tags)
- ✅ Create, edit, and delete snippets
- ✅ Syntax highlighting for 100+ languages
- ✅ Collections and tags
- ✅ Team collaboration through organizations
- ✅ Organization member management
- ✅ Email invitations for organizations
- ✅ Multi-tenancy support (personal + organization snippets)
- ✅ Subscription tiers (FREE/PRO) with feature gating

### Coming Soon

- Public snippet sharing
- API access
- Advanced analytics
- Custom domains (Pro tier)
- SSO/SAML (Enterprise)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
