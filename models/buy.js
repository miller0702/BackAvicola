const db = require("../config/configPg");

const Buys = {};

Buys.getAll = () => {
  const sql = "SELECT * FROM buys;";
  return db.manyOrNone(sql);
};

Buys.findById = async (id) => {
  try {
    const sql = `
      SELECT
          id,
          fecha,
          proveedor_id,
          lote_id,
          procedencia,
          tipo_purina,
          cantidad_bultos,
          valor_unitario,
          valor_flete,
          valor_bultos,
          valor_con_flete
      FROM
          buys
      WHERE
          id=$1`;
    const buy = await db.oneOrNone(sql, id);
    return buy;
  } catch (error) {
    throw new Error(`Error al obtener la compra por ID: ${error.message}`);
  }
};

Buys.create = async (buys) => {
  try {
    const sql = `
      INSERT INTO
          buys(
              proveedor_id,
              lote_id,
              procedencia,
              tipo_purina,
              cantidad_bultos,
              valor_unitario,
              valor_flete,
              valor_bultos,
              valor_con_flete,
              fecha,
              created_at,
              updated_at
          )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
      `;
    const newBuyId = await db.one(sql, [
      buys.proveedor_id,
      buys.lote_id,
      buys.procedencia,
      buys.tipo_purina,
      buys.cantidad_bultos,
      buys.valor_unitario,
      buys.valor_flete,
      buys.valor_bultos,
      buys.valor_con_flete,
      buys.fecha,
      new Date(),
      new Date(),
    ]);
    return newBuyId;
  } catch (error) {
    throw new Error(`Error al crear la compra: ${error.message}`);
  }
};

Buys.deleteById = async (id) => {
  try {
    const sql = `
        DELETE FROM
          buys
        WHERE
          id=$1
      `;
    await db.none(sql, id);
  } catch (error) {
    throw new Error(`Error al eliminar la compra: ${error.message}`);
  }
};

Buys.update = async (buys) => {
  try {
    const sql = `
        UPDATE
          buys
        SET
          proveedor_id=$1,
          lote_id=$2,
          procedencia=$3,
          tipo_purina=$4,
          cantidad_bultos=$5,
          valor_unitario=$6,
          valor_flete=$7,
          valor_bultos=$8,
          valor_con_flete=$9,
          fecha=$10,
          updated_at=$11
        WHERE
          id=$12
      `;
    await db.none(sql, [
      buys.proveedor_id,
      buys.lote_id,
      buys.procedencia,
      buys.tipo_purina,
      buys.cantidad_bultos,
      buys.valor_unitario,
      buys.valor_flete,
      buys.valor_bultos,
      buys.valor_con_flete,
      buys.fecha,
      new Date(),
      buys.id,
    ]);
  } catch (error) {
    throw new Error(`Error al actualizar la compra: ${error.message}`);
  }
};

Buys.getTotalBuys = async () => {
  try {
    const sql = `
      SELECT
      COALESCE(SUM(b.valor_con_flete), 0) AS totalcompras
      FROM
          buys b
      JOIN
          lote l ON b.lote_id = l.id
      WHERE
          l.estado = 'activo';
      `;
    const totalBuys = await db.oneOrNone(sql);
    return totalBuys;
  } catch (error) {
    throw new Error(`Error al obtener el total de compras: ${error.message}`);
  }
};

module.exports = Buys;
