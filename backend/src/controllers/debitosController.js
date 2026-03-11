"use strict";

const debitosService = require("../services/debitosService");
const logger         = require("../utils/logger");

/**
 * POST /api/debitos/consulta
 *
 * Body: { cpfCnpj, celular, email, inscricaoRural? }
 * Response: { debitos[], quantidade, totalConsolidado }
 */
async function consultar(req, res, next) {
  const { cpfCnpj, celular, email, inscricaoRural } = req.body;

  // Log the request without exposing full document number
  logger.info(
    `Consulta initiated – doc: ***${cpfCnpj.slice(-4)} | IP: ${req.ip}`
  );

  try {
    const result = await debitosService.consultarDebitos(cpfCnpj);

    // TODO: persist lead (celular, email, inscricaoRural) to a leads table

    if (result.quantidade === 0) {
      return res.json({
        encontrou: false,
        mensagem: "Nenhum debito ativo encontrado para o documento informado.",
        quantidade: 0,
        totalConsolidado: 0,
        debitos: [],
      });
    }

    return res.json({
      encontrou: true,
      quantidade: result.quantidade,
      totalConsolidado: result.totalConsolidado,
      debitos: result.debitos,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { consultar };
