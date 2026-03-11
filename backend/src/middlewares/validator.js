"use strict";

const { body, validationResult } = require("express-validator");

/* ── Sanitise helper ── */
const onlyDigits = (value) => value.replace(/\D/g, "");

/* ── Rules ── */
const consultaRules = [
  body("cpfCnpj")
    .notEmpty().withMessage("CPF ou CNPJ e obrigatorio.")
    .customSanitizer(onlyDigits)
    .custom((v) => {
      if (v.length !== 11 && v.length !== 14) {
        throw new Error("Informe um CPF (11 digitos) ou CNPJ (14 digitos) valido.");
      }
      return true;
    }),

  body("celular")
    .notEmpty().withMessage("Celular e obrigatorio.")
    .customSanitizer(onlyDigits)
    .isLength({ min: 10, max: 11 }).withMessage("Celular invalido."),

  body("email")
    .notEmpty().withMessage("E-mail e obrigatorio.")
    .isEmail().withMessage("E-mail invalido.")
    .normalizeEmail(),

  body("inscricaoRural")
    .optional()
    .customSanitizer(onlyDigits)
    .isLength({ min: 8, max: 13 }).withMessage("Inscricao rural invalida."),
];

/* ── Middleware that checks the result ── */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: "Dados invalidos.",
      fields: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { consultaRules, validate };
