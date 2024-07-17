const db = require("../config/configPg");

const Supplies = {};

Supplies.getAll = () => {
  const sql = "SELECT * FROM supplies;";
  return db.manyOrNone(sql);
};

Supplies.findById = (id, callback) => {
  const sql = `
    SELECT
        id,
        proveedor_id,
        descripcioncompra,
        preciocompra,
        fecha
    FROM
        supplies
    WHERE
        id=$1`;
  return db.oneOrNone(sql, id).then((supplies) => {
    callback(null, supplies);
  });
};

Supplies.create = (supplies) => {
  const sql = `
    INSERT INTO
        supplies(
            proveedor_id,
            descripcioncompra,
            preciocompra,
            fecha,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6) RETURNING id
    `;
  return db.oneOrNone(sql, [
    supplies.proveedor_id,
    supplies.descripcioncompra,
    supplies.preciocompra,
    supplies.fecha,
    new Date(),
    new Date(),
  ]);
};

Supplies.deleteById = async (id) => {
  const sql = `
      DELETE FROM
        supplies
      WHERE
        id=$1
    `;
  await db.none(sql, id);
};

Supplies.update = async (supplies) => {
  const sql = `
      UPDATE
        supplies
      SET
        proveedor_id=$1,
        descripcioncompra=$2,
        preciocompra=$3,
        fecha=$4,
        updated_at=$5
      WHERE
        id=$6
    `;
  await db.none(sql, [
    supplies.proveedor_id,
    supplies.descripcioncompra,
    supplies.preciocompra,
    supplies.fecha,
    new Date(),
    supplies.id,
  ]);
};

Supplies.getTotalSupplies = () => {
  const sql = `
    SELECT
        SUM(preciocompra) AS totalcompras
    FROM
        supplies;
    `;
  return db.oneOrNone(sql);
};

module.exports = Supplies;
