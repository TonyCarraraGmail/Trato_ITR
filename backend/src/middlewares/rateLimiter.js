"use strict";

const rateLimit = require("express-rate-limit");
const logger    = require("../utils/logger");

/**
 * General API rate limiter.
 * Default: 30 requests per minute per IP.
 * Adjust via .env: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)       || 30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    error: "Muitas requisicoes. Tente novamente em alguns instantes.",
  },
  handler(req, res, _next, options) {
    logger.warn(`Rate limit exceeded – IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Stricter limiter for the /consulta endpoint.
 * 10 requests per minute per IP to protect DB load.
 */
const consultaLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    error: "Limite de consultas atingido. Tente novamente em 1 minuto.",
  },
  handler(req, res, _next, options) {
    logger.warn(`Consulta rate limit exceeded – IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = { apiLimiter, consultaLimiter };
