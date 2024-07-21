const db = require('../config/configPg.js');

const Supplier = {};

Supplier.getAll = () => {
    const sql = 'SELECT * FROM suppliers;';
    return db.manyOrNone(sql);
};

Supplier.findById = (id) => {
    const sql = `
    SELECT
        id,
        nombre,
        telefono,
        documento
    FROM
        suppliers
    WHERE
        id=$1
    `;
    return db.oneOrNone(sql, id);
};

Supplier.create = (supplier) => {
    const sql = `
    INSERT INTO
        suppliers(
            nombre,
            telefono,
            documento,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5)
    RETURNING id
    `;
    return db.one(sql, [
        supplier.nombre,
        supplier.telefono,
        supplier.documento,
        new Date(),
        new Date()
    ]);
};

Supplier.update = (supplier) => {
    const sql = `
    UPDATE
        suppliers
    SET
        nombre=$1,
        telefono=$2,
        documento=$3,
        updated_at=$4
    WHERE
        id=$5
    `;
    return db.none(sql, [
        supplier.nombre,
        supplier.telefono,
        supplier.documento,
        new Date(),
        supplier.id
    ]);
};

Supplier.delete = (id) => {
    const sql = `
    DELETE FROM
        suppliers
    WHERE
        id=$1
    `;
    return db.none(sql, id);
};


Supplier.getTotalSuppliers = () => {
    const sql = `
        SELECT COUNT(DOCUMENTO)AS totalsuppliers FROM suppliers;
    `;
    return db.oneOrNone(sql);
};

module.exports = Supplier;
