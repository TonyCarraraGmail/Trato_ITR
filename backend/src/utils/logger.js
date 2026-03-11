"use strict";

const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs   = require("fs");

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = format;

const lineFormat = printf(({ level, message, timestamp, stack }) =>
  `${timestamp} [${level}] ${stack || message}`
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    lineFormat
  ),
  transports: [
    // Console (dev-friendly)
    new transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), lineFormat),
    }),
    // Persistent file logs
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 20 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

module.exports = logger;
