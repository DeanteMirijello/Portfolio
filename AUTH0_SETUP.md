# Auth0 Setup (Step-by-step)

Follow these steps to enable login, admin gating, and authenticated API calls.

## 1) Create a tenant (if needed)
- Go to https://manage.auth0.com and create/login to a tenant.

## 2) Create an Application (SPA)
- Applications → Create Application → Name: "Portfolio SPA" → Type: Single Page Web Applications
- In Settings:
  - Allowed Callback URLs:
    - http://localhost:4321
  - Allowed Logout URLs:
    - http://localhost:4321
  - Allowed Web Origins:
    - http://localhost:4321
- Save changes and copy:
  - Domain → put in `PUBLIC_AUTH0_DOMAIN`
  - Client ID → put in `PUBLIC_AUTH0_CLIENT_ID`

## 3) Create an API (for access tokens)
- APIs → Create API
  - Name: Portfolio API
  - Identifier (Audience): e.g., `https://portfolio-api` (copy this value)
  - Signing Algorithm: RS256
- In API Settings, enable RBAC (optional but recommended if you will use roles):
  - Enable RBAC
  - Add permissions in the Access Token (optional)

Use the API Identifier as your Audience in both backend and frontend:
- Backend `.env`: `AUTH0_AUDIENCE=...`
- Frontend `.env`: `PUBLIC_AUTH0_AUDIENCE=...`

## 4) (Option A) Admin by email (quickest)
- Add your admin email(s) to backend `.env` as comma-separated list:
  - `AUTH0_ALLOWED_ADMIN_EMAILS=you@example.com`
- Optionally, set the same on the frontend to show the Admin link early:
  - `PUBLIC_ADMIN_EMAILS=you@example.com`

## 4) (Option B) Admin by Role (recommended)
- Create a role (User Management → Roles → Create Role) named `admin`
- Assign role `admin` to your account (Users → select your user → Roles)
- Expose roles in tokens via an Action:
  - Actions → Library → Build Custom → Name: `Add Roles to Tokens`
  - Code example:
    ```js
    exports.onExecutePostLogin = async (event, api) => {
      const namespace = 'https://your.app/';
      const roles = (event.authorization?.roles) || [];
      api.idToken.setCustomClaim(`${namespace}roles`, roles);
      api.accessToken.setCustomClaim(`${namespace}roles`, roles);
    };
    ```
  - Deploy and add this Action to the Login Flow.
- Update your env to match the claim name:
  - Backend: `AUTH0_ROLES_CLAIM=https://your.app/roles`
  - Frontend: `PUBLIC_AUTH0_ROLES_CLAIM=https://your.app/roles`

## 5) Wire environment variables
- Backend: copy `Backend/.env.example` → `Backend/.env` and fill values:
  - `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_ALLOWED_ADMIN_EMAILS` (optional)
- Frontend: copy `Frontend/.env.example` → `Frontend/.env` and fill values:
  - `PUBLIC_AUTH0_DOMAIN`, `PUBLIC_AUTH0_CLIENT_ID`, `PUBLIC_AUTH0_AUDIENCE`, `PUBLIC_ADMIN_EMAILS` (optional)

## 6) Install & run
```bash
# Backend
cd Backend
npm install
npm run dev

# Frontend (in another terminal)
cd ../Frontend
npm install
npm run dev
```

Visit http://localhost:4321 and use the Login button in the top nav.
- Admin link should appear only for admins.
- Testimonials page should allow authenticated users to submit a testimonial and send a message.
