import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";

let helmet: any;
let rateLimit: any;

try {
  helmet = require("helmet");
} catch (e) {
  // helmet not installed, skip
}

try {
  rateLimit = require("express-rate-limit");
} catch (e) {
  // express-rate-limit not installed, skip
}

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Trust proxy — required when running behind Caddy/nginx reverse proxy
app.set("trust proxy", 1);

// Security headers
if (helmet) {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(
  cors({
    credentials: true,
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
      // Allow any origin for webchat public API (widget embedded on external sites)
      // This is handled dynamically; the path check happens via a separate middleware below
      callback(null, origin || "*");
    }
  })
);

// Override CORS for webchat public routes to allow any origin without credentials
app.use("/api/webchat/public", (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.removeHeader("Access-Control-Allow-Credentials");
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

// Rate limiting on API routes
if (rateLimit) {
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    validate: { xForwardedForHeader: false }
  });
  app.use("/api", apiLimiter);
}

app.use(Sentry.Handlers.requestHandler());

// Health check — before auth, for monitoring
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/public", express.static(uploadConfig.directory));

// Serve webchat widget static files with permissive headers (embedded on external sites)
import path from "path";
app.use("/webchat", (_req: Request, res: Response, next: NextFunction) => {
  // Override Helmet's restrictive cross-origin headers for widget embedding
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  res.removeHeader("X-Frame-Options");
  next();
}, express.static(path.resolve(__dirname, "..", "public", "webchat")));

app.use("/api", routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;

