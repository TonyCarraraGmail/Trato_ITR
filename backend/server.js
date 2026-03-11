"use strict";

require("dotenv").config();

const express    = require("express");
const helmet     = require("helmet");
const cors       = require("cors");
const morgan     = require("morgan");
const compression = require("compression");

const logger      = require("./src/utils/logger");
const errorHandler = require("./src/middlewares/errorHandler");
const routes      = require("./src/routes");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ──────────────────────────────────────────────
   Security headers
   ────────────────────────────────────────────── */
app.use(helmet());

/* ──────────────────────────────────────────────
   CORS
   ────────────────────────────────────────────── */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ──────────────────────────────────────────────
   Body parsing & compression
   ────────────────────────────────────────────── */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(compression());

/* ──────────────────────────────────────────────
   HTTP request logging
   ────────────────────────────────────────────── */
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

/* ──────────────────────────────────────────────
   Trust proxy (behind OpenLiteSpeed / nginx)
   ────────────────────────────────────────────── */
app.set("trust proxy", 1);

/* ──────────────────────────────────────────────
   Routes
   ────────────────────────────────────────────── */
app.use("/api", routes);

/* ──────────────────────────────────────────────
   Health-check (used by load balancers / PM2)
   ────────────────────────────────────────────── */
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

/* ──────────────────────────────────────────────
   404 handler
   ────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

/* ──────────────────────────────────────────────
   Central error handler
   ────────────────────────────────────────────── */
app.use(errorHandler);

/* ──────────────────────────────────────────────
   Start
   ────────────────────────────────────────────── */
app.listen(PORT, "127.0.0.1", () => {
  logger.info(`TratoAgro ITR API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
