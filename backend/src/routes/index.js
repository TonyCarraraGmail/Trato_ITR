"use strict";

const { Router } = require("express");
const { apiLimiter } = require("../middlewares/rateLimiter");
const debitosRoutes  = require("./debitosRoutes");

const router = Router();

// Apply general rate limit to every /api/* route
router.use(apiLimiter);

router.use("/debitos", debitosRoutes);

// Future modules:
// router.use("/leads",     require("./leadsRoutes"));
// router.use("/pagamento", require("./pagamentoRoutes"));

module.exports = router;
