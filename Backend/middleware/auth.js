import { auth } from "express-oauth2-jwt-bearer";

let cachedAuthMiddleware = null;

function getAuthConfig() {
  const domain = process.env.AUTH0_DOMAIN;
  const audience = process.env.AUTH0_AUDIENCE;
  if (!domain || !audience) return null;
  return {
    audience,
    issuerBaseURL: `https://${domain}/`,
    tokenSigningAlg: "RS256",
  };
}

// Validates JWTs issued by Auth0 for this API
export function authRequired(req, res, next) {
  const config = getAuthConfig();
  if (!config) {
    return res.status(500).json({
      error: "Auth0 is not configured on the server",
      missing: ["AUTH0_DOMAIN", "AUTH0_AUDIENCE"],
    });
  }

  if (!cachedAuthMiddleware) {
    cachedAuthMiddleware = auth(config);
  }
  return cachedAuthMiddleware(req, res, next);
}

// Admin check: allow via custom roles claim or allowed emails list
export const adminOnly = [
  authRequired,
  (req, res, next) => {
    try {
      const payload = req.auth?.payload || {};
      const rolesClaim = process.env.AUTH0_ROLES_CLAIM || "https://your.app/roles";
      const emailClaim = process.env.AUTH0_EMAIL_CLAIM || "email";

      const roles = payload[rolesClaim] || payload.roles || [];
      const email = payload[emailClaim] || payload["https://your.app/email"]; // fallback if using custom email claim

      const allowedEmails = (process.env.AUTH0_ALLOWED_ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const hasAdminRole = Array.isArray(roles) && roles.includes("admin");
      const isAllowedEmail = email && allowedEmails.includes(String(email).toLowerCase());

      if (hasAdminRole || isAllowedEmail) return next();
      return res.status(403).json({ error: "Forbidden" });
    } catch (e) {
      return res.status(403).json({ error: "Forbidden" });
    }
  },
];
