import * as Auth0Spa from "https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2.1.3/+esm";

function resolveCreateAuth0Client() {
  if (typeof Auth0Spa.createAuth0Client === "function") return Auth0Spa.createAuth0Client;
  if (typeof Auth0Spa.default === "function") return Auth0Spa.default;
  if (Auth0Spa.default && typeof Auth0Spa.default.createAuth0Client === "function") {
    return Auth0Spa.default.createAuth0Client;
  }
  throw new Error("Auth0 SDK export not found");
}

const createAuth0Client = resolveCreateAuth0Client();

const state = {
  ready: false,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  isAdmin: false,
};

function getConfig() {
  const el = document.querySelector("[data-auth-config]");
  if (!el) return null;
  const domain = el.dataset.authDomain;
  const clientId = el.dataset.authClient;
  const audience = el.dataset.authAud;
  const dbConnection = el.dataset.authDbConnection || "";
  const adminEmails = (el.dataset.adminEmails || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const rolesClaim = el.dataset.rolesClaim || "https://your.app/roles";
  const missing = [];
  if (!domain) missing.push("PUBLIC_AUTH0_DOMAIN");
  if (!clientId) missing.push("PUBLIC_AUTH0_CLIENT_ID");
  if (!audience) missing.push("PUBLIC_AUTH0_AUDIENCE");
  return { domain, clientId, audience, dbConnection, adminEmails, rolesClaim, missing };
}

function computeIsAdmin(user, rolesClaim, adminEmails) {
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  const roles = user[rolesClaim] || user.roles || [];
  const byRole = Array.isArray(roles) && roles.includes("admin");
  const byEmail = !!email && adminEmails.includes(email);
  return byRole || byEmail;
}

async function init() {
  const cfg = getConfig();
  const redirectUri = window.location.origin;
  if (!cfg || !cfg.domain || !cfg.clientId || !cfg.audience) {
    const missing = cfg?.missing?.length ? cfg.missing.join(", ") : "PUBLIC_AUTH0_DOMAIN, PUBLIC_AUTH0_CLIENT_ID, PUBLIC_AUTH0_AUDIENCE";
    console.warn(`Auth config missing; auth disabled. Missing: ${missing}`);
    window.__auth = {
      disabled: true,
      missing,
      ready: true,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      async getAccessToken() {
        return null;
      },
      async login() {
        window.alert(`Auth is not configured yet.\nMissing env vars: ${missing}`);
      },
      async logout() {},
      async refresh() {},
    };
    state.ready = true;
    dispatch();
    return;
  }

  const client = await createAuth0Client({
    domain: cfg.domain,
    clientId: cfg.clientId,
    cacheLocation: "localstorage",
    useRefreshTokens: false,
    authorizationParams: {
      audience: cfg.audience,
      redirect_uri: redirectUri,
      scope: "openid profile email",
    },
  });

  // Handle redirect callback (after login/signup) using the SAME client instance
  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    try {
      const callback = await client.handleRedirectCallback();
      const returnTo = callback?.appState?.returnTo;
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      if (returnTo && returnTo !== window.location.pathname) {
        window.location.replace(returnTo);
        return;
      }
    } catch (e) {
      console.error("Auth0 redirect error", e);
    }
  }

  async function refresh() {
    try {
      state.isAuthenticated = await client.isAuthenticated();
      state.user = state.isAuthenticated ? await client.getUser() : null;
      state.accessToken = state.isAuthenticated
        ? await client.getTokenSilently({ authorizationParams: { audience: cfg.audience } })
        : null;
      state.isAdmin = computeIsAdmin(state.user, cfg.rolesClaim, cfg.adminEmails);
    } catch (e) {
      console.warn("Auth refresh failed", e);
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.isAdmin = false;
    }
    state.ready = true;
    dispatch();
  }

  async function login() {
    const authParams = {
      audience: cfg.audience,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      prompt: "login",
    };

    await client.loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
      authorizationParams: authParams,
    });
  }

  async function signup() {
    const signupParams = {
      audience: cfg.audience,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      screen_hint: "signup",
    };
    if (cfg.dbConnection) {
      signupParams.connection = cfg.dbConnection;
    }

    await client.loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
      authorizationParams: signupParams,
    });
  }

  async function logout() {
    await client.logout({ logoutParams: { returnTo: redirectUri } });
  }

  window.__auth = {
    get ready() {
      return state.ready;
    },
    get isAuthenticated() {
      return state.isAuthenticated;
    },
    get user() {
      return state.user;
    },
    get isAdmin() {
      return state.isAdmin;
    },
    async getAccessToken() {
      if (!state.isAuthenticated) return null;
      try {
        const token = await client.getTokenSilently({ authorizationParams: { audience: cfg.audience } });
        state.accessToken = token;
        return token;
      } catch (e) {
        console.warn("Failed to get token", e);
        return null;
      }
    },
    login,
    signup,
    logout,
    refresh,
  };

  await refresh();
}

function dispatch() {
  const ev = new CustomEvent("auth:change", { detail: { ...state } });
  window.dispatchEvent(ev);
}

// Auto-init on load
init();
