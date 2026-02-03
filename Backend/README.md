# Backend (Express)

A minimal Express API to power the Astro portfolio.

## Features
- Health check at `/` and `/health`
- `POST /contact` with validation (`name`, `email`, `message`)
- CORS configured for Astro dev (`http://localhost:4321`) via `ALLOW_ORIGIN`
- Security headers (`helmet`), logging (`morgan`), centralized error handling

## Setup
1. Copy `.env.example` to `.env` and adjust values:
   ```env
   PORT=3001
   ALLOW_ORIGIN=http://localhost:4321
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

## API
- `GET /` or `GET /health` → `{ status: "ok" }`
- `POST /contact`
  - Body: `{ name: string, email: string, message: string }`
  - Responses:
    - `200 { success: true }`
    - `400 { errors: ValidationError[] }`

## Next steps
- Integrate a real mailer (e.g., Nodemailer or an API like Resend/SendGrid)
- Add rate limiting and basic request IDs
- Create a `projects` endpoint backed by a JSON file for dynamic content on the Projects page
- Wire the Astro frontend to call `POST /contact` from a form (optional for now)
