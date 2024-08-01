const db = require('../config/configPg.js');

const Discount = {};

Discount.getAll = () => {
    const sql = 'SELECT * FROM discounts;';
    return db.manyOrNone(sql);
};

Discount.findById = (id) => {
    const sql = `
    SELECT
        id,
        cliente_id,
        lote_id,
        valor,
        descripcion,
        fecha, 
        numerofactura   
    FROM
        discounts
    WHERE
        id=$1`;
    return db.oneOrNone(sql, id);
};

Discount.create = (discount) => {
    const sql = `
    INSERT INTO
        discounts (
            cliente_id,
            lote_id,
            valor,
            descripcion,
            fecha,
            numerofactura,
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;
    `;
    return db.oneOrNone(sql, [
        discount.cliente_id,
        discount.lote_id,
        discount.valor,
        discount.descripcion,
        discount.fecha,
        discount.numerofactura,
        new Date(),
        new Date()
    ]);
};

Discount.deleteById = async (id) => {
    const sql = `
      DELETE FROM
        discounts
      WHERE
        id=$1;
    `;
    await db.none(sql, id);
};

Discount.update = async (discount) => {
    const sql = `
      UPDATE
        discounts
      SET
        cliente_id=$1,
        lote_id=$2,
        valor=$3,
        descripcion=$4,
        fecha=$5,    
        numerofactura=$6,
        updated_at=$7
      WHERE
        id=$8;
    `;
    await db.none(sql, [
        discount.cliente_id,
        discount.lote_id,
        discount.valor,
        discount.descripcion,
        discount.fecha,
        discount.numerofactura,
        new Date(),
        discount.id
    ]);
};

Discount.findByNumeroFactura = (numerofactura) => {
    const sql = `
    SELECT
        id,
        cliente_id,
        lote_id,
        valor,
        descripcion,
        fecha, 
        numerofactura   
    FROM
        discounts
    WHERE
        numerofactura=$1`;
    return db.oneOrNone(sql, numerofactura).then(result => {
        return result;
    });
};

Discount.getTotalDiscount = () => {
    const sql = `
    SELECT 
        COALESCE( SUM(d.valor) , 0) AS TOTAL_DISCOUNTS
    FROM 
        discounts d
    INNER JOIN lote l on d.lote_id = l.id
    WHERE l.estado = 'activo'
    `;
    return db.oneOrNone(sql);
};

module.exports = Discount;
