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
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
      `;
    const newBuyId = await db.one(sql, [
      buys.proveedor_id,
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
          procedencia=$2,
          tipo_purina=$3,
          cantidad_bultos=$4,
          valor_unitario=$5,
          valor_flete=$6,
          valor_bultos=$7,
          valor_con_flete=$8,
          fecha=$9,
          updated_at=$10
        WHERE
          id=$11
      `;
    await db.none(sql, [
      buys.proveedor_id,
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
          SUM(valor_con_flete) AS totalcompras
      FROM
          buys;
      `;
    const totalBuys = await db.oneOrNone(sql);
    return totalBuys;
  } catch (error) {
    throw new Error(`Error al obtener el total de compras: ${error.message}`);
  }
};

module.exports = Buys;
