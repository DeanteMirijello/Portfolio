# Backend (Express)

Express API for the Astro portfolio with JSON-backed content and Auth0-protected admin endpoints.

## Features
- Health check at `/` and `/health`
- Public reads for content: `/home`, `/projects`, `/skills`, `/about/work`, `/testimonials`, `/contact`
- Authenticated actions:
  - `POST /testimonials` (any logged-in user)
  - `POST /contact/message` (any logged-in user)
- Admin-only updates (requires admin role or allowed email):
  - `PUT /home`, `POST/PUT/DELETE /projects`,
  - `POST/PUT/DELETE /skills/*`, `PUT /skills/types/:name/titles`,
  - `PUT /contact`, `POST/PUT/DELETE /contact/items`,
  - `PUT /about/work`, `PUT/DELETE /testimonials/:id`
- CORS for Astro dev (`http://localhost:4321`) and localhost hosts
- Security headers (`helmet`), logging (`morgan`), centralized error handling

## Setup
1. Copy `.env.example` to `.env` (or create a new `.env`) and set:
   ```env
   PORT=3001
   ALLOW_ORIGIN=http://localhost:4321

   # Auth0 (required for protected routes)
   AUTH0_DOMAIN=your-tenant.us.auth0.com
   AUTH0_AUDIENCE=your-api-identifier
   # Optional admin checks
  AUTH0_ALLOWED_ADMIN_EMAILS=you@example.com,teacher@example.com
   # If you expose roles in a custom claim, set it (default shown):
   AUTH0_ROLES_CLAIM=https://your.app/roles
   ```
2. Install dependencies:
   ```bash
   cd Backend
   npm install
   ```

## Run
- Development (auto-restart):
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

The server listens on `http://localhost:3001` by default.

## Auth0 notes
- The API validates `Authorization: Bearer <access_token>` using `express-oauth2-jwt-bearer`.
- Admin is detected if either:
  - The access token (or user) has `"admin"` in the roles claim (`AUTH0_ROLES_CLAIM`), or
  - The user email matches `AUTH0_ALLOWED_ADMIN_EMAILS` (comma-separated).
- For a teacher submission login, create that teacher user (email/password) in your Auth0 database connection, then add their email to `AUTH0_ALLOWED_ADMIN_EMAILS`.

## Next steps
- Integrate a real mailer (e.g., Resend/SendGrid) in `POST /contact/message`
- Add rate limiting and request IDs
