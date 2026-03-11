"use strict";

const pool               = require("../config/database");
const { cacheGet, cacheSet } = require("../config/redis");
const logger             = require("../utils/logger");

/**
 * Query the divida_ativa_uniao table by CPF or CNPJ.
 *
 * IMPORTANT: Adapt the SELECT column names to match your actual
 * table schema. Run  DESC trat_itr.divida_ativa_uniao;  on the
 * server to list the real column names.
 *
 * @param {string} cpfCnpj  Digits only, 11 (CPF) or 14 (CNPJ) chars
 * @returns {Promise<{debitos: Array, total: number}>}
 */
async function consultarDebitos(cpfCnpj) {
  const cacheKey = `debitos:${cpfCnpj}`;

  // ── Cache hit ──
  const cached = await cacheGet(cacheKey);
  if (cached) {
    logger.info(`Cache HIT for key ${cacheKey}`);
    return cached;
  }

  // ── DB query ──
  // Adapt the column names below to match your real schema.
  const [rows] = await pool.execute(
    `SELECT
        id,
        nr_cpf_cnpj         AS cpfCnpj,
        nome_devedor        AS nomeDevedor,
        numero_inscricao    AS numeroInscricao,
        exercicio,
        valor_consolidado   AS valorConsolidado,
        situacao,
        data_inscricao      AS dataInscricao
     FROM divida_ativa_uniao
     WHERE nr_cpf_cnpj = ?
       AND situacao NOT IN ('QUITADO', 'CANCELADO')
     ORDER BY exercicio DESC`,
    [cpfCnpj]
  );

  const totalConsolidado = rows.reduce(
    (acc, r) => acc + parseFloat(r.valorConsolidado || 0),
    0
  );

  const result = {
    debitos: rows,
    quantidade: rows.length,
    totalConsolidado: parseFloat(totalConsolidado.toFixed(2)),
  };

  // ── Cache store ──
  await cacheSet(cacheKey, result);

  return result;
}

module.exports = { consultarDebitos };
