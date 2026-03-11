"use strict";

const mysql  = require("mysql2/promise");
const logger = require("../utils/logger");

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "127.0.0.1",
  port:     parseInt(process.env.DB_PORT)     || 3306,
  database:           process.env.DB_NAME     || "trat_itr",
  user:               process.env.DB_USER     || "trat_admin",
  password:           process.env.DB_PASSWORD || "",

  // Connection pool settings
  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_POOL_MAX)     || 20,
  queueLimit:         0,
  idleTimeout:        parseInt(process.env.DB_POOL_IDLE)    || 10000,
  connectTimeout:     parseInt(process.env.DB_POOL_ACQUIRE) || 30000,

  // Performance
  namedPlaceholders:  true,
  timezone:           "-03:00",          // Brasília
  charset:            "utf8mb4",

  // Keep-alive
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

/* ── Verify connection on startup ── */
(async () => {
  try {
    const conn = await pool.getConnection();
    logger.info("MySQL pool connected successfully");
    conn.release();
  } catch (err) {
    logger.error(`MySQL connection error: ${err.message}`);
    process.exit(1);
  }
})();

module.exports = pool;
