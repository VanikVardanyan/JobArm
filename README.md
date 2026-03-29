# JobArm

Job board for Armenia built with Next.js, Prisma, PostgreSQL, and NextAuth.

## Stack

- Next.js 15
- React 19
- Prisma
- PostgreSQL
- NextAuth with Google login

## Local setup

1. Use Node.js 20.
2. Install dependencies:

```bash
npm install
```

3. Create local env file:

```bash
cp .env.example .env
```

4. Fill these variables in `.env`:

- `DATABASE_URL`: pooled PostgreSQL connection string for the app
- `DIRECT_URL`: direct PostgreSQL connection string for Prisma migrations
- `NEXTAUTH_URL`: `http://localhost:3000` locally
- `NEXTAUTH_SECRET`: random long secret
- `GOOGLE_CLIENT_ID`: Google OAuth client id
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

5. Apply migrations:

```bash
npm run db:deploy
```

6. Start the app:

```bash
npm run dev
```

## Database notes

This project uses Prisma with PostgreSQL.

- `DATABASE_URL` is used by the running app
- `DIRECT_URL` is used by Prisma for schema migrations
- For Supabase, `DATABASE_URL` should usually use the pooler connection
- For Supabase, `DIRECT_URL` should usually use the direct port `5432`

## Vercel deploy

1. Import the GitHub repo into Vercel.
2. In Project Settings -> Environment Variables, add all values from `.env.example`.
3. In Build & Development Settings, set the build command to:

```bash
npm run vercel-build
```

4. If your database already contains tables created outside Prisma migrations, do not run `prisma migrate deploy` during Vercel build. This repo already uses a safe build command that skips automatic migrations.
5. Set the production domain.
6. Update `NEXTAUTH_URL` to your production domain, for example:

```bash
https://your-domain.am
```

7. In Google Cloud Console, add these Authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://your-domain.am/api/auth/callback/google
```

## Existing database and Prisma

If Prisma shows `P3005`, it means the database is already populated and Prisma migrations were not baselined yet.

For now, deployment can proceed without running migrations in Vercel build.

Later, if you want a fully managed Prisma migration flow, baseline the current production database first and only then use:

```bash
npm run db:deploy
```

## Useful commands

```bash
npm run dev
npm run lint
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```
