"use strict";

const { Router } = require("express");
const { consultaRules, validate } = require("../middlewares/validator");
const { consultaLimiter }         = require("../middlewares/rateLimiter");
const debitosController           = require("../controllers/debitosController");

const router = Router();

/**
 * POST /api/debitos/consulta
 *
 * Runs:
 *   1. Strict rate limiter (10 req/min per IP)
 *   2. Input validation + sanitisation
 *   3. Controller → Service → DB (+ cache)
 */
router.post(
  "/consulta",
  consultaLimiter,
  consultaRules,
  validate,
  debitosController.consultar
);

module.exports = router;
