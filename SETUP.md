# Trackify Ventures - Setup Guide

This application uses MongoDB, Prisma, and Better Auth for authentication and data management.

## Prerequisites

- Node.js 18+ and pnpm installed
- MongoDB running locally or a MongoDB connection string

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/trackify-ventures"
# Or use MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/trackify-ventures"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# Next.js
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# UploadThing (for file uploads)
# Get your keys from https://uploadthing.com
UPLOADTHING_SECRET="your-uploadthing-secret-key"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Admin Access (comma-separated list of admin emails)
ADMIN_EMAILS="admin@example.com,another-admin@example.com"
```

**Important:** Generate a secure secret key for `BETTER_AUTH_SECRET`. You can use:
```bash
openssl rand -base64 32
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Setup

Better Auth will automatically create the required collections (user, session, account, verification) when you first use the authentication features.

For Prisma models, generate the Prisma client:
```bash
npx prisma generate
```

### 4. Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Authentication

### Sign Up
Navigate to `/sign-up` to create a new account.

### Sign In
Navigate to `/sign-in` to sign in with your credentials.

### Protected Routes
The following routes require authentication:
- `/dashboard`
- `/portfolio`
- `/deal-flow`
- `/reports`
- `/analytics`
- `/founder/*`
- `/deal-room/*`
- `/accelerator`
- `/admin`

Unauthenticated users will be redirected to `/sign-in`.

## Architecture Notes

- **Better Auth**: Uses the MongoDB adapter directly for authentication (recommended for MongoDB)
- **Prisma**: Used for application-specific models (portfolio companies, deals, etc.)
- **MongoDB**: Single database with multiple collections

## Development

### Adding New Models

1. Add your model to `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Use the Prisma client in your application code

### Authentication

- Auth configuration: `lib/auth.ts`
- Auth client: `lib/auth-client.ts`
- Auth API route: `app/api/auth/[...all]/route.ts`
- Protected routes: `middleware.ts`

## Admin Dashboard

The admin dashboard is available at `/admin` and provides:
- User management and analytics
- View all registered users
- Search and filter users by role
- User statistics and signup trends
- Onboarding completion metrics

To access the admin dashboard:
1. Set `ADMIN_EMAILS` in your `.env` file with comma-separated admin email addresses
2. Sign in with one of the admin emails
3. Navigate to `/admin`

Alternatively, you can set a user's role to `"admin"` in the database, or add an `isAdmin: true` field to their user document.

## Admin Dashboard

The admin dashboard is available at `/admin` and provides:
- User management and analytics
- View all registered users
- Search and filter users by role
- User statistics and signup trends
- Onboarding completion metrics

To access the admin dashboard:
1. Set `ADMIN_EMAILS` in your `.env` file with comma-separated admin email addresses
2. Sign in with one of the admin emails
3. Navigate to `/admin`

Alternatively, you can set a user's role to `"admin"` in the database, or add an `isAdmin: true` field to their user document.

## Production Deployment

1. Set secure environment variables
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. **Important**: Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to your production URL:
   ```env
   BETTER_AUTH_URL="https://atlas.mytrackify.com"
   NEXT_PUBLIC_BETTER_AUTH_URL="https://atlas.mytrackify.com"
   ```
   Note: The auth client will automatically use the current origin if `NEXT_PUBLIC_BETTER_AUTH_URL` is not set or contains "localhost", but it's recommended to set it explicitly.
4. Ensure `BETTER_AUTH_SECRET` is a strong, random secret
5. Set `ADMIN_EMAILS` with your admin email addresses

### CORS Issues

If you encounter CORS errors in production:
- Ensure `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` are set to your production domain (e.g., `https://atlas.mytrackify.com`)
- The auth client will automatically use `window.location.origin` if the env var is not set or contains "localhost"
- Make sure both URLs match your actual production domain

