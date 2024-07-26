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
    SELECT
    SUM(
        ((
            (SELECT SUM(llenado) FROM UNNEST(canastas_llenas) AS llenado) -
            (SELECT SUM(vaciado) FROM UNNEST(canastas_vacias) AS vaciado)
        ) * preciokilo)
    ) AS total_sales
    FROM sales;
    `;
    return db.oneOrNone(sql);
};

Sale.getTotales = () => {
    const sql = `
    SELECT 
    SUPPLIES_TOTAL.TOTAL_SUPPLIES,
    BUYS_TOTAL.TOTAL_BUYS,
	TOTAL_LOTE.PRECIO_LOTE,
    SALES_TOTAL.TOTAL_SALES
    FROM 
    (SELECT SUM(PRECIOCOMPRA) AS TOTAL_SUPPLIES 
     FROM SUPPLIES
    ) AS SUPPLIES_TOTAL,
	 (SELECT PRECIO AS PRECIO_LOTE
     FROM LOTE
    ) AS TOTAL_LOTE,
    (SELECT SUM(VALOR_CON_FLETE) AS TOTAL_BUYS 
     FROM BUYS
    ) AS BUYS_TOTAL,
    (SELECT 
        SUM(preciokilo * (
            (SELECT COALESCE(SUM(llenado), 0) FROM UNNEST(canastas_llenas) AS llenado) -
            (SELECT COALESCE(SUM(vaciado), 0) FROM UNNEST(canastas_vacias) AS vaciado)
        )) AS TOTAL_SALES
     FROM sales
    ) AS SALES_TOTAL;
    `;
    return db.oneOrNone(sql);
};

Sale.getVentasPorMes = async () => {
    const sql = `
    WITH ventas_expandidas AS (
        SELECT
            fecha,
            preciokilo,
            unnest(canastas_llenas) - unnest(canastas_vacias) AS canastas
        FROM sales
    )
    SELECT
        TO_CHAR(DATE_TRUNC('month', fecha), 'YYYY-MM') AS mes,
        SUM(preciokilo * canastas) AS total_ventas
    FROM ventas_expandidas
    GROUP BY DATE_TRUNC('month', fecha)
    ORDER BY mes;
    `;
    return db.any(sql);
};

Sale.getSaleForDay = async () => {
    const sql = `
    WITH ventas_expandidas AS (
    SELECT
        fecha,
        preciokilo,
        cantidadaves,
        -- Calcula la diferencia entre canastas llenas y vacías
        COALESCE(
            (SELECT SUM(llenado) FROM UNNEST(canastas_llenas) AS llenado) -
            (SELECT SUM(vaciado) FROM UNNEST(canastas_vacias) AS vaciado),
            0
        ) AS diferencia_canastas
    FROM sales
    )
    SELECT
        TO_CHAR(fecha, 'YYYY-MM-DD') AS dia,
        SUM(preciokilo * diferencia_canastas) AS total_ventas,
        SUM(cantidadaves) AS total_cantidad_aves
    FROM ventas_expandidas
    GROUP BY fecha
    ORDER BY dia;
    `;
    return db.any(sql);
};

Sale.getSaleForDayCustomer = async () => {
    const sql = `
      SELECT 
          S.cliente_id,
          S.cantidadaves,
          TO_CHAR(S.fecha, 'YYYY-MM-DD') AS dia,
          SUM(S.preciokilo * (
              (SELECT SUM(llenado) FROM UNNEST(S.canastas_llenas) AS llenado) -
              (SELECT SUM(vaciado) FROM UNNEST(S.canastas_vacias) AS vaciado)
          )) AS total_compras
      FROM 
          sales S
      GROUP BY 
          S.cliente_id, S.fecha, S.cantidadaves
      ORDER BY 
          S.fecha;
    `;
    console.log(`Ejecutando consulta SQL para todas las ventas por día`);
    return db.any(sql);
}

module.exports = Sale;


