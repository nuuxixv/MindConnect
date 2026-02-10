import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

// Only fetch OIDC config if we are on Replit
const getOidcConfig = memoize(
  async () => {
    if (!process.env.REPL_ID) return null;
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Auto-create session table if needed
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET ?? "fallback_secret_for_dev",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  const isReplit = !!process.env.REPL_ID;

  if (isReplit) {
    // --- Replit Auth Strategy ---
    const config = await getOidcConfig();
    
    if (config) {
      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      const registeredStrategies = new Set<string>();
      const ensureStrategy = (domain: string) => {
        const strategyName = `replitauth:${domain}`;
        if (!registeredStrategies.has(strategyName)) {
          const strategy = new Strategy(
            {
              name: strategyName,
              config,
              scope: "openid email profile offline_access",
              callbackURL: `https://${domain}/api/callback`,
            },
            verify
          );
          passport.use(strategy);
          registeredStrategies.add(strategyName);
        }
      };

      app.get("/api/login", (req, res, next) => {
        ensureStrategy(req.hostname);
        passport.authenticate(`replitauth:${req.hostname}`, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      });

      app.get("/api/callback", (req, res, next) => {
        ensureStrategy(req.hostname);
        passport.authenticate(`replitauth:${req.hostname}`, {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/login",
        })(req, res, next);
      });

      app.get("/api/logout", (req, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      });
    }
  } else {
    // --- Local Strategy (Render / Dev) ---
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      // Demo: Accept any login
      try {
        const user = {
          claims: {
            sub: email, // Use email as ID (Simple string)
            email: email,
            first_name: email.split('@')[0],
            last_name: 'User',
            profile_image_url: 'https://github.com/shadcn.png'
          },
          expires_at: Math.floor(Date.now() / 1000) + 86400 // 1 day from now
        };
        await upsertUser(user.claims); // Upsert to DB
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

    // Serve a simple HTML Login Form for non-Replit environments
    app.get("/api/login", (req, res) => {
      if (req.isAuthenticated()) return res.redirect("/");
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login - Mind Connect</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 flex items-center justify-center h-screen">
          <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Mind Connect Login</h1>
            <p class="mb-4 text-sm text-gray-600 text-center">Demo Environment (Render)<br>Enter any email to sign in.</p>
            <form action="/api/login" method="POST" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" required placeholder="name@example.com" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" required placeholder="any password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign In
              </button>
            </form>
          </div>
        </body>
        </html>
      `;
      res.send(html);
    });

    app.post("/api/login", passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/api/login'
    }));

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Basic check: is passport session active?
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extra check for Replit token expiration if present
  if (user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now > user.expires_at) {
      // If refresh token exists (Replit), try to refresh
      const refreshToken = user.refresh_token;
      if (refreshToken && process.env.REPL_ID) {
        try {
          const config = await getOidcConfig();
          if (config) {
            const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
            updateUserSession(user, tokenResponse);
            return next();
          }
        } catch (error) {
          console.error("Token refresh failed", error);
        }
      }
      // If we fall through here, either no refresh token or refresh failed
      // But for LocalStrategy, we set a long expires_at so it shouldn't expire often.
      // If it does, just 401.
      return res.status(401).json({ message: "Session expired" });
    }
  }

  return next();
};
