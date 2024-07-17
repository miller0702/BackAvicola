const db = require('../config/configPg.js');

const Lote = {};

Lote.getAll = () => {
    const sql = 'SELECT * FROM lote;';
    return db.manyOrNone(sql);
};

Lote.findById = (id) => {
    const sql = `
    SELECT
        id,
        proveedor_id,
        descripcion,
        cantidad_aves,
        precio,
        fecha_llegada
    FROM
        lote
    WHERE
        id = $1`;
    return db.oneOrNone(sql, id);
};

Lote.deleteById = async (id) => {
    const sql = `
    DELETE FROM
        lote
    WHERE
        id = $1
    `;
    await db.none(sql, [id]);
};

Lote.update = async (lote) => {
    const sql = `
    UPDATE
        lote
    SET
        proveedor_id = $1,
        descripcion = $2,
        cantidad_aves = $3,
        precio = $4,
        fecha_llegada = $5,
        updated_at = $6
    WHERE
        id = $7
    `;
    await db.none(sql, [
        lote.proveedor_id,
        lote.descripcion,
        lote.cantidad_aves,
        lote.precio,
        lote.fecha_llegada,
        new Date(),
        lote.id
    ]);
};

Lote.updateDescripcion = (id, descripcion) => {
    const sql = `
    UPDATE
        lote
    SET
        descripcion = $1
    WHERE
        id = $2`;
    return db.none(sql, [descripcion, id]);
};

Lote.updateCantidadAves = (id, cantidad_aves) => {
    const sql = `
    UPDATE
        lote
    SET
        cantidad_aves = $1
    WHERE
        id = $2`;
    return db.none(sql, [cantidad_aves, id]);
};

Lote.create = (lote) => {
    const sql = `
    INSERT INTO
        lote(
            proveedor_id,
            descripcion,
            cantidad_aves,
            precio,
            fecha_llegada,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `;
    return db.one(sql, [
        lote.proveedor_id,
        lote.descripcion,
        lote.cantidad_aves,
        lote.precio,
        lote.fecha_llegada,
        new Date(),
        new Date()
    ]);
};

module.exports = Lote;
