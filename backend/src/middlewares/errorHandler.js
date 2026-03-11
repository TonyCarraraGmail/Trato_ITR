"use strict";

const logger = require("../utils/logger");

/**
 * Central Express error handler.
 * Must be registered LAST with app.use().
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  logger.error(`${req.method} ${req.originalUrl} → ${status}: ${err.message}`, {
    stack: err.stack,
    ip: req.ip,
  });

  const body = {
    error:
      status < 500
        ? err.message
        : "Erro interno do servidor. Tente novamente em instantes.",
  };

  // In development, expose the stack trace
  if (process.env.NODE_ENV === "development" && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
