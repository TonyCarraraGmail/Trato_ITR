"use strict";

const Redis  = require("ioredis");
const logger = require("../utils/logger");

const ENABLED = process.env.REDIS_ENABLED === "true";

let client = null;

if (ENABLED) {
  client = new Redis({
    host:     process.env.REDIS_HOST     || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    lazyConnect: false,
  });

  client.on("connect", () => logger.info("Redis connected"));
  client.on("error",   (err) => logger.warn(`Redis error: ${err.message}`));
}

/* ──────────────────────────────────────────────
   Cache helpers
   ────────────────────────────────────────────── */
const TTL = parseInt(process.env.REDIS_TTL_SECONDS) || 300;

/**
 * Get a cached JSON value. Returns null if Redis is disabled or key missing.
 * @param {string} key
 */
async function cacheGet(key) {
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Store a JSON value in cache.
 * @param {string} key
 * @param {*} value
 * @param {number} [ttl]  seconds
 */
async function cacheSet(key, value, ttl = TTL) {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    /* silent – cache miss is acceptable */
  }
}

/**
 * Invalidate a cache key.
 * @param {string} key
 */
async function cacheDel(key) {
  if (!client) return;
  try { await client.del(key); } catch { /* silent */ }
}

module.exports = { client, cacheGet, cacheSet, cacheDel, ENABLED };
