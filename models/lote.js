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

Lote.getReporteLote = (loteId) => {
    const sql = `
    WITH ventas AS (
    SELECT 
        lote_id, 
        SUM(preciokilo * (
            COALESCE(
                (SELECT SUM(llenado) FROM UNNEST(canastas_llenas) AS llenado), 0
            ) - 
            COALESCE(
                (SELECT SUM(vaciado) FROM UNNEST(canastas_vacias) AS vaciado), 0
            )
        )) AS total_ventas,
        SUM(
            COALESCE(
                (SELECT SUM(llenado) FROM UNNEST(canastas_llenas) AS llenado), 0
            ) - 
            COALESCE(
                (SELECT SUM(vaciado) FROM UNNEST(canastas_vacias) AS vaciado), 0
            )
        ) AS total_kilos
    FROM 
        sales
    GROUP BY 
        lote_id
),
compras_insumos AS (
    SELECT 
        lote_id, 
        SUM(preciocompra) AS total_compras_insumos
    FROM 
        supplies
    GROUP BY 
        lote_id
),
compras_alimento AS (
    SELECT 
        lote_id, 
        COUNT(id) AS total_compras,
        SUM(valor_con_flete) AS total_compras_alimento
    FROM 
        buys
    GROUP BY 
        lote_id
),
costo_lote AS (
    SELECT 
        id AS lote_id, 
        SUM(precio) AS costo_total_lote
    FROM 
        lote
    GROUP BY 
        id
),
mortalidad AS (
    SELECT 
        lote_id, 
        SUM(cantidadmacho + cantidadhembra) AS total_mortalidad  
    FROM 
        mortality 
    GROUP BY 
        lote_id
),
consumo_alimento AS (
    SELECT 
        lote_id, 
        SUM(cantidadmacho + cantidadhembra) AS total_consumo_alimento  
    FROM 
        food 
    GROUP BY 
        lote_id
)
SELECT 
    l.id AS lote_id,
    l.descripcion AS descripcion,
    l.cantidad_aves AS aves,
    COALESCE(ca.total_compras, 0) AS total_compras,
    COALESCE(v.total_ventas, 0) AS total_ventas,
    COALESCE(v.total_kilos, 0) AS total_kilos,
    COALESCE(m.total_mortalidad, 0) AS total_mortalidad,
    COALESCE(ci.total_compras_insumos, 0) AS total_compras_insumos,
    COALESCE(ca.total_compras_alimento, 0) AS total_compras_alimento,
    COALESCE(f.total_consumo_alimento, 0) AS total_consumo_alimento,
    COALESCE(cl.costo_total_lote, 0) AS costo_total_lote,
    COALESCE(v.total_ventas, 0) - (COALESCE(ci.total_compras_insumos, 0) + COALESCE(ca.total_compras_alimento, 0) + COALESCE(cl.costo_total_lote, 0)) AS ganancias,
    COALESCE(ci.total_compras_insumos, 0) + COALESCE(ca.total_compras_alimento, 0) + COALESCE(cl.costo_total_lote, 0) AS gastos
FROM 
    lote l
LEFT JOIN 
    ventas v ON l.id = v.lote_id
LEFT JOIN 
    compras_insumos ci ON l.id = ci.lote_id
LEFT JOIN 
    compras_alimento ca ON l.id = ca.lote_id
LEFT JOIN 
    costo_lote cl ON l.id = cl.lote_id
LEFT JOIN 
    consumo_alimento f ON l.id = f.lote_id
LEFT JOIN 
    mortalidad m ON l.id = m.lote_id
WHERE 
    l.id = $1;

    `;
    return db.oneOrNone(sql, [loteId]);  // Pasar el parámetro como un array
};


Lote.getTotalLote = () => {
    const sql = `
        SELECT
    (COALESCE(totallote, 0) - COALESCE(vendidas, 0) - COALESCE(muertas, 0)) AS totallote
FROM (
    SELECT 
        (SELECT SUM(cantidad_aves) FROM lote WHERE id = '1') AS totallote
) AS lote_info
LEFT JOIN (
    SELECT SUM(cantidadaves) AS vendidas FROM sales WHERE lote_id = '1'
) AS sales_info ON true
LEFT JOIN (
    SELECT SUM(cantidadmacho + cantidadhembra) AS muertas FROM mortality WHERE lote_id = '1'
) AS mortality_info ON true;;
    `;
    return db.oneOrNone(sql);
};


module.exports = Lote;


