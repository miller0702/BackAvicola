const db = require('../config/configPg.js');

const Sale = {};

Sale.getAll = () => {
    const sql = 'SELECT * FROM sales;';
    return db.manyOrNone(sql);
};

Sale.findById = (id) => {
    const sql = `
    SELECT
        id,
        cliente_id,
        lote_id,
        user_id,
        cantidadaves,
        canastas_vacias,
        canastas_llenas,
        preciokilo,
        fecha, 
        numerofactura   
    FROM
        sales
    WHERE
        id=$1`;
    return db.oneOrNone(sql, id);
};

Sale.create = (sale) => {
    const sql = `
    INSERT INTO
        sales (
            cliente_id,
            lote_id,
            user_id,
            cantidadaves,
            canastas_vacias,
            canastas_llenas,
            preciokilo,
            fecha,
            numerofactura,
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;
    `;
    return db.oneOrNone(sql, [
        sale.cliente_id,
        sale.lote_id,
        sale.user_id,
        sale.cantidadaves,
        sale.canastas_vacias,
        sale.canastas_llenas,
        sale.preciokilo,
        sale.fecha,
        sale.numerofactura,
        new Date(),
        new Date()
    ]);
};

Sale.deleteById = async (id) => {
    const sql = `
      DELETE FROM
        sales
      WHERE
        id=$1;
    `;
    await db.none(sql, id);
};

Sale.update = async (sale) => {
    const sql = `
      UPDATE
        sales
      SET
        cliente_id=$1,
        lote_id=$2,
        user_id=$3,
        cantidadaves=$4,
        canastas_vacias=$5,
        canastas_llenas=$6,
        preciokilo=$7,
        fecha=$8,    
        numerofactura=$9,
        updated_at=$10
      WHERE
        id=$11;
    `;
    await db.none(sql, [
        sale.cliente_id,
        sale.lote_id,
        sale.user_id,
        sale.cantidadaves,
        sale.canastas_vacias,
        sale.canastas_llenas,
        sale.preciokilo,
        sale.fecha,
        sale.numerofactura,
        new Date(),
        sale.id
    ]);
};

Sale.findByNumeroFactura = (numerofactura) => {
    const sql = `
    SELECT
        id,
        cliente_id,
        lote_id,
        user_id,
        cantidadaves,
        canastas_vacias,
        canastas_llenas,
        preciokilo,
        fecha, 
        numerofactura   
    FROM
        sales
    WHERE
        numerofactura=$1`;
    return db.oneOrNone(sql, numerofactura).then(result => {
        return result;
    });
};

Sale.getTotalSale = () => {
    const sql = `
    SELECT ROUND(SUM(total)) AS totalGeneral FROM (SELECT cantidadaves * preciokilo AS total FROM sales) AS subquery;
    `;
    return db.oneOrNone(sql);
};

Sale.getTotales = () => {
    const sql = `
    SELECT 
    TOTAL_SUPPLIES,
    TOTAL_SALES,
    TOTAL_BUYS
FROM (
    SELECT SUM(PRECIOCOMPRA) AS TOTAL_SUPPLIES 
    FROM SUPPLIES
) AS SUPPLIES_TOTAL,
(
    SELECT SUM(VALOR_CON_FLETE) AS TOTAL_BUYS 
    FROM BUYS
) AS BUYS_TOTAL,
(
    SELECT 
        SUM(preciokilo * (canastas_llenas[i] - canastas_vacias[i])) AS TOTAL_SALES
    FROM 
        sales,
        generate_series(array_lower(canastas_vacias, 1), array_upper(canastas_vacias, 1)) AS i
) AS SALES_TOTAL;

    `;
    return db.oneOrNone(sql);
};

module.exports = Sale;
