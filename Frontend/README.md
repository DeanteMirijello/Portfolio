# Frontend (Astro)

Astro frontend for the portfolio. Includes client-side Auth0 login, admin link visibility, and authenticated forms.

## Env
Create an `.env` file (or use `.env.local`) with:

```env
PUBLIC_API_BASE=http://localhost:3001

# Auth0 SPA
PUBLIC_AUTH0_DOMAIN=your-tenant.us.auth0.com
PUBLIC_AUTH0_CLIENT_ID=your-spa-client-id
PUBLIC_AUTH0_AUDIENCE=your-api-identifier
PUBLIC_AUTH0_DB_CONNECTION=Username-Password-Authentication
PUBLIC_AUTH0_ROLES_CLAIM=https://your.app/roles
# Optional shortcut: comma-separated emails that count as admin on the client
PUBLIC_ADMIN_EMAILS=you@example.com,teacher@example.com
```

## Commands

| Command           | Action                                      |
|-------------------|---------------------------------------------|
| `npm install`     | Install deps                                 |
| `npm run dev`     | Start dev server at `http://localhost:4321` |
| `npm run build`   | Build to `./dist/`                           |
| `npm run preview` | Preview the build                            |

## Auth0 UX
- Login/Logout buttons appear in the top nav.
- The Admin link only appears when the user is an admin (role or allowed email).
- Testimonials page shows:
	- Auth-only testimonial form (POST `/testimonials`).
	- Auth-only “Send a message” form (POST `/contact/message`).

## Teacher admin account (email + password)
- Create the teacher user in Auth0 database connection (`Username-Password-Authentication`) with their own email and password.
- Add that email to backend `AUTH0_ALLOWED_ADMIN_EMAILS` and frontend `PUBLIC_ADMIN_EMAILS`.
- Redeploy backend and frontend so both allowlists are updated.
