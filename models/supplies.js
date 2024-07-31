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
        lote_id,
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
            lote_id,
            descripcioncompra,
            preciocompra,
            fecha,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
  return db.oneOrNone(sql, [
    supplies.proveedor_id,
    supplies.lote_id,
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
        lote_id=$2,
        descripcioncompra=$3,
        preciocompra=$4,
        fecha=$5,
        updated_at=$6
      WHERE
        id=$7
    `;
  await db.none(sql, [
    supplies.proveedor_id,
    supplies.lote_id,
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
        COALESCE(SUM(s.preciocompra),0) AS totalcompras
    FROM
        supplies s
    INNER JOIN lote l on s.lote_id = l.id
    WHERE l.estado = 'activo';
    `;
  return db.oneOrNone(sql);
};

module.exports = Supplies;
