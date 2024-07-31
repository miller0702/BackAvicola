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
            cantidadaves,
            canastas_vacias,
            canastas_llenas,
            preciokilo,
            fecha,
            numerofactura,
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;
    `;
    return db.oneOrNone(sql, [
        sale.cliente_id,
        sale.lote_id,
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
        cantidadaves=$3,
        canastas_vacias=$4,
        canastas_llenas=$5,
        preciokilo=$6,
        fecha=$7,    
        numerofactura=$8,
        updated_at=$9
      WHERE
        id=$10;
    `;
    await db.none(sql, [
        sale.cliente_id,
        sale.lote_id,
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
    WITH lotes_activos AS (
        SELECT id
        FROM lote
        WHERE estado = 'activo'
    )
    SELECT
        COALESCE(
            SUM(
                (
                    (SELECT COALESCE(SUM(llenado), 0) FROM UNNEST(canastas_llenas) AS llenado) -
                    (SELECT COALESCE(SUM(vaciado), 0) FROM UNNEST(canastas_vacias) AS vaciado)
                ) * preciokilo
            ),
            0
        ) AS total_sales
    FROM sales
    WHERE lote_id IN (SELECT id FROM lotes_activos);

    `;
    return db.oneOrNone(sql);
};

Sale.getTotales = () => {
    const sql = `
    WITH lotes_activos AS (
        SELECT id
        FROM lote
        WHERE estado = 'activo'
    ),
    supplies_total AS (
        SELECT 
            SUM(PRECIOCOMPRA) AS TOTAL_SUPPLIES 
        FROM SUPPLIES
    ),
    buys_total AS (
        SELECT 
            COALESCE(SUM(VALOR_CON_FLETE), 0) AS TOTAL_BUYS
        FROM BUYS
        WHERE lote_id IN (SELECT id FROM lotes_activos)
    ),
    total_lote AS (
        SELECT 
            COALESCE(PRECIO, 0) AS PRECIO_LOTE
        FROM LOTE
        WHERE id IN (SELECT id FROM lotes_activos)
    ),
    sales_total AS (
        SELECT 
            SUM(preciokilo * (
                (SELECT COALESCE(SUM(llenado), 0) FROM UNNEST(canastas_llenas) AS llenado) -
                (SELECT COALESCE(SUM(vaciado), 0) FROM UNNEST(canastas_vacias) AS vaciado)
            )) AS TOTAL_SALES
        FROM sales
        WHERE lote_id IN (SELECT id FROM lotes_activos)
    )
    SELECT 
        COALESCE(supplies_total.TOTAL_SUPPLIES, 0) AS TOTAL_SUPPLIES,
        COALESCE(buys_total.TOTAL_BUYS, 0) AS TOTAL_BUYS,
        COALESCE(total_lote.PRECIO_LOTE, 0) AS PRECIO_LOTE,
        COALESCE(sales_total.TOTAL_SALES, 0) AS TOTAL_SALES
    FROM 
        supplies_total,
        buys_total,
        total_lote,
        sales_total;
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
    WITH lotes_activos AS (
        SELECT id
        FROM lote
        WHERE estado = 'activo'
    ),
    ventas_filtradas AS (
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
        WHERE lote_id IN (SELECT id FROM lotes_activos)
    )
    SELECT
        TO_CHAR(fecha, 'YYYY-MM-DD') AS dia,
        SUM(preciokilo * diferencia_canastas) AS total_ventas,
        SUM(cantidadaves) AS total_cantidad_aves
    FROM ventas_filtradas
    GROUP BY fecha
    ORDER BY dia;

    `;
    return db.any(sql);
};

Sale.getSaleForDayCustomer = async () => {
    const sql = `
        WITH lotes_activos AS (
            SELECT id
            FROM lote
            WHERE estado = 'activo'
        ),
        ventas_filtradas AS (
            SELECT
                S.cliente_id,
                S.cantidadaves,
                S.fecha,
                S.preciokilo,
                S.canastas_llenas,
                S.canastas_vacias
            FROM
                sales S
            JOIN
                lotes_activos L ON S.lote_id = L.id
        )
        SELECT 
            V.cliente_id,
            V.cantidadaves,
            TO_CHAR(V.fecha, 'YYYY-MM-DD') AS dia,
            SUM(V.preciokilo * (
                (SELECT SUM(llenado) FROM UNNEST(V.canastas_llenas) AS llenado) -
                (SELECT SUM(vaciado) FROM UNNEST(V.canastas_vacias) AS vaciado)
            )) AS total_compras
        FROM 
            ventas_filtradas V
        GROUP BY 
            V.cliente_id, V.fecha, V.cantidadaves
        ORDER BY 
            V.fecha;

    `;
    return db.any(sql);
}

module.exports = Sale;


