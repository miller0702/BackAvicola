const db = require('../config/configPg.js');


const Lote = {};

Lote.getAll = () => {
    const sql = 'SELECT * FROM lote;';
    return db.manyOrNone(sql);
};

Lote.getAllActive = () => {
    const sql = `SELECT * FROM lote where estado = 'activo';`;
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
        fecha_llegada,
        estado
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
        estado = $6,
        updated_at = $7
    WHERE
        id = $8
    `;
    await db.none(sql, [
        lote.proveedor_id,
        lote.descripcion,
        lote.cantidad_aves,
        lote.precio,
        lote.fecha_llegada,
        lote.estado,
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

Lote.updateEstado = (id, estado) => {

    if (!['activo', 'inactivo'].includes(estado)) {
        return Promise.reject(new Error("Estado inválido. Debe ser 'activo' o 'inactivo'."));
    }

    const sql = `
      UPDATE
          lote
      SET
          estado = $1
      WHERE
          id = $2
    `;
    return db.none(sql, [estado, id])
        .catch(error => {
            console.error(`Error en la actualización del estado en la base de datos: ${error.message}`);
            throw error;
        });
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
            estado,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
    `;
    return db.one(sql, [
        lote.proveedor_id,
        lote.descripcion,
        lote.cantidad_aves,
        lote.precio,
        lote.fecha_llegada,
        lote.estado || 'activo',
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
    return db.oneOrNone(sql, [loteId]);
};

Lote.getReporteLoteBuys = (loteId) => {
    const sql = `
    SELECT 
        b.fecha,
        s.nombre as proveedor,
        l.descripcion as lote,
        CASE
	        WHEN b.procedencia = 'Ocana' THEN 'Ocaña'
            WHEN b.procedencia = 'Bucaramanga' THEN 'Bucaramanga'
            ELSE 'Desconocido'
        END AS procedencia,
        CASE
            WHEN b.tipo_purina = 'P' THEN 'Preiniciación'
            WHEN b.tipo_purina = 'I' THEN 'Iniciación'
            WHEN b.tipo_purina = 'Q' THEN 'Engorde Quebrantada'
            WHEN b.tipo_purina = 'E' THEN 'Engorde'
            ELSE 'Desconocido'
        END AS tipo_purina,
        b.cantidad_bultos,
        b.valor_unitario,
        b.valor_bultos,
        b.valor_flete,
        b.valor_con_flete
    FROM BUYS B 
    INNER JOIN LOTE L ON B.lote_id = L.ID
    INNER JOIN suppliers s on b.proveedor_id = s.id
    WHERE L.ID = $1
    `;
    return db.any(sql, [loteId]);
};

Lote.getReporteLoteFood = (loteId) => {
    const sql = `
    SELECT
        f.fecha,
        l.descripcion as lote,
        f.cantidadhembra,
        f.cantidadmacho
    FROM FOOD F 
    INNER JOIN LOTE L ON F.lote_id = L.ID
    WHERE L.ID = $1
    ORDER BY f.fecha ASC
    `;
    return db.any(sql, [loteId]);
};

Lote.getReporteLoteMortality = (loteId) => {
    const sql = `
    SELECT
        M.fecha,
        l.descripcion as lote,
        M.cantidadhembra,
        M.cantidadmacho
    FROM MORTALITY M 
    INNER JOIN LOTE L ON M.lote_id = L.ID
    WHERE L.ID = $1
    ORDER BY M.fecha ASC
    `;
    return db.any(sql, [loteId]);
};

Lote.getReporteLoteSupplies = (loteId) => {
    const sql = `
    SELECT 
        s.fecha,
        S.descripcioncompra as descripcion,
        s.preciocompra as valor,
        l.descripcion as lote,
        su.nombre as proveedor
    FROM SUPPLIES S
    INNER JOIN LOTE L ON S.lote_id = L.ID
    INNER JOIN suppliers su on s.proveedor_id = su.id 
    WHERE L.ID = $1
    ORDER BY s.fecha ASC
    `;
    return db.any(sql, [loteId]);
};

Lote.getReporteLoteSales = (loteId) => {
    const sql = `
    SELECT 
        s.fecha,
        s.numerofactura,
        c.nombre AS cliente,
        l.descripcion AS lote,
        s.cantidadaves as aves,
        s.preciokilo AS precio,
        COALESCE(
            (SELECT COALESCE(SUM(llenado),0) FROM UNNEST(s.canastas_llenas) AS llenado) -
            (SELECT COALESCE(SUM(vaciado),0) FROM UNNEST(s.canastas_vacias) AS vaciado), 0
        ) AS kilos,
        s.preciokilo * COALESCE(
            (SELECT COALESCE(SUM(llenado),0) FROM UNNEST(s.canastas_llenas) AS llenado) -
            (SELECT COALESCE(SUM(vaciado),0) FROM UNNEST(s.canastas_vacias) AS vaciado), 0
        ) AS total
    FROM sales s
    INNER JOIN customers c ON s.cliente_id = c.id
    INNER JOIN lote l ON s.lote_id = l.id
    WHERE l.id = $1
    ORDER BY s.fecha ASC;
    `;
    return db.any(sql, [loteId]);
};

Lote.getReporteLotePayments = (loteId) => {
    const sql = `
    SELECT
        p.fecha,
        c.nombre as cliente,
        c.telefono as telefono,
        p.metodo_pago,
        p.valor
    FROM payments p
    INNER JOIN customers c on p.cliente_id = c.id
    INNER JOIN lote l on p.lote_id = l.id
    WHERE l.id = $1
    ORDER BY p.fecha ASC
    `;
    return db.any(sql, [loteId]);
};

Lote.getReporteLoteCustomers = (loteId) => {
    const sql = `
    WITH Sales_Calculated AS (
        SELECT 
            S.lote_id,
            S.cliente_id,
            SUM(S.preciokilo * (
                (SELECT SUM(llenado) FROM UNNEST(S.canastas_llenas) AS llenado) -
                (SELECT SUM(vaciado) FROM UNNEST(S.canastas_vacias) AS vaciado)
            )) AS total_sales
        FROM 
            sales S
        GROUP BY 
            S.lote_id, S.cliente_id
    ),
    Payments_Sum AS (
        SELECT 
            P.lote_id,
            P.cliente_id,
            P.fecha,
            SUM(P.valor) OVER (PARTITION BY P.lote_id, P.cliente_id ORDER BY P.fecha) AS total_payments
        FROM 
            payments P
    ),
    Payments_Last_Abono AS (
        SELECT 
            P.lote_id,
            P.cliente_id,
            MAX(P.fecha) AS fecha_ultima,
            (SELECT valor FROM payments WHERE lote_id = P.lote_id AND cliente_id = P.cliente_id ORDER BY fecha DESC LIMIT 1) AS ultimo_abono
        FROM 
            payments P
        GROUP BY 
            P.lote_id, P.cliente_id
    ),
    Customer_Lote_Details AS (
        SELECT 
            C.id AS cliente_id,
            C.nombre AS cliente_nombre,
            L.id AS lote_id,
            L.descripcion AS lote_nombre,
            COALESCE(SC.total_sales, 0) AS total_sales,
            COALESCE(MAX(PS.total_payments), 0) AS total_payments,
            COALESCE(PLA.ultimo_abono, 0) AS ultimo_abono
        FROM 
            customers C
        LEFT JOIN 
            Sales_Calculated SC ON C.id = SC.cliente_id
        LEFT JOIN 
            lote L ON SC.lote_id = L.id
        LEFT JOIN 
            Payments_Sum PS ON SC.lote_id = PS.lote_id AND SC.cliente_id = PS.cliente_id
        LEFT JOIN 
            Payments_Last_Abono PLA ON SC.lote_id = PLA.lote_id AND SC.cliente_id = PLA.cliente_id
        GROUP BY 
            C.id, C.nombre, L.id, L.descripcion, SC.total_sales, PLA.ultimo_abono
    )
    SELECT
        CLD.cliente_id,
        CLD.cliente_nombre,
        CLD.lote_id,
        CLD.lote_nombre,
        CLD.total_sales,
        CLD.total_payments,
        CLD.total_sales - CLD.total_payments AS deuda_actual
    FROM 
        Customer_Lote_Details CLD
    WHERE 
        CLD.lote_id = $1
    ORDER BY 
        CLD.cliente_id, CLD.lote_id;

    `;
    return db.any(sql, [loteId]);
};

Lote.getTotalLote = () => {
    const sql = `
        WITH lotes_activos AS (
            SELECT id
            FROM lote
            WHERE estado = 'activo'
        ),
        lote_info AS (
            SELECT
                COALESCE(SUM(cantidad_aves), 0) AS totallote
            FROM
                lote
            WHERE id IN (SELECT id FROM lotes_activos)
        ),
        sales_info AS (
            SELECT
                COALESCE(SUM(cantidadaves), 0) AS vendidas
            FROM
                sales
            WHERE lote_id IN (SELECT id FROM lotes_activos)
        ),
        mortality_info AS (
            SELECT
                COALESCE(SUM(cantidadmacho + cantidadhembra), 0) AS muertas
            FROM
                mortality
            WHERE lote_id IN (SELECT id FROM lotes_activos)
        )
        SELECT
            CASE
                WHEN EXISTS (SELECT id FROM lotes_activos) THEN
                    COALESCE(lote_info.totallote, 0) - COALESCE(sales_info.vendidas, 0) - COALESCE(mortality_info.muertas, 0)
                ELSE NULL
            END AS totallote
        FROM
            lote_info
        LEFT JOIN
            sales_info ON true
        LEFT JOIN
            mortality_info ON true
        WHERE
            EXISTS (SELECT id FROM lotes_activos);

    `;
    return db.oneOrNone(sql);
};

module.exports = Lote;


