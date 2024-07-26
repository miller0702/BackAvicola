const db = require('../config/configPg.js');

const Payment = {};

Payment.getAll = () => {
    const sql = 'SELECT * FROM payments;';
    return db.manyOrNone(sql);
};

Payment.findById = (id) => {
    const sql = `
    SELECT
        id,
        cliente_id,
        lote_id,
        valor,
        metodo_pago,
        fecha, 
        numerofactura   
    FROM
        payments
    WHERE
        id=$1`;
    return db.oneOrNone(sql, id);
};

Payment.create = (payment) => {
    const sql = `
    INSERT INTO
        payments (
            cliente_id,
            lote_id,
            valor,
            metodo_pago,
            fecha,
            numerofactura,
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;
    `;
    return db.oneOrNone(sql, [
        payment.cliente_id,
        payment.lote_id,
        payment.valor,
        payment.metodo_pago,
        payment.fecha,
        payment.numerofactura,
        new Date(),
        new Date()
    ]);
};

Payment.deleteById = async (id) => {
    const sql = `
      DELETE FROM
        payments
      WHERE
        id=$1;
    `;
    await db.none(sql, id);
};

Payment.update = async (payment) => {
    const sql = `
      UPDATE
        payments
      SET
        cliente_id=$1,
        lote_id=$2,
        valor=$3,
        metodo_pago=$4,
        fecha=$5,    
        numerofactura=$6,
        updated_at=$7
      WHERE
        id=$8;
    `;
    await db.none(sql, [
        payment.cliente_id,
        payment.lote_id,
        payment.valor,
        payment.metodo_pago,
        payment.fecha,
        payment.numerofactura,
        new Date(),
        payment.id
    ]);
};

Payment.findByNumeroFactura = (numerofactura) => {
    const sql = `
    SELECT
        id,
        cliente_id,
        lote_id,
        valor,
        metodo_pago,
        fecha, 
        numerofactura   
    FROM
        payments
    WHERE
        numerofactura=$1`;
    return db.oneOrNone(sql, numerofactura).then(result => {
        return result;
    });
};

Payment.getTotalPayment = () => {
    const sql = `
    SELECT 
        SUM(valor) AS TOTAL_PAYMENTS
    FROM 
        payments
    `;
    return db.oneOrNone(sql);
};

Payment.getDeudaActual = async (clienteId, fechaActual) => {
    const query = `
    WITH Sales_Calculated AS (
        SELECT 
            S.cliente_id,
            SUM(S.preciokilo * (
                (SELECT SUM(llenado) FROM UNNEST(S.canastas_llenas) AS llenado) -
                (SELECT SUM(vaciado) FROM UNNEST(S.canastas_vacias) AS vaciado)
            )) AS total_sales
        FROM 
            sales S
        WHERE 
            S.cliente_id = $1
        GROUP BY 
            S.cliente_id
    ),
    Payments_Sum AS (
        SELECT 
            P.cliente_id,
            P.fecha,
            SUM(P.valor) OVER (PARTITION BY P.cliente_id ORDER BY P.fecha) AS total_payments
        FROM 
            payments P
        WHERE 
            P.cliente_id = $1
    ),
    Payments_Last_Abono AS (
        SELECT 
            P.cliente_id,
            MAX(P.fecha) AS fecha_ultima,
            (SELECT valor FROM payments WHERE cliente_id = P.cliente_id ORDER BY fecha DESC LIMIT 1) AS ultimo_abono
        FROM 
            payments P
        WHERE 
            P.cliente_id = $1
        GROUP BY 
            P.cliente_id
    ),
    Customer_Balance AS (
        SELECT
            C.id, 
            C.nombre, 
            C.documento, 
            C.telefono,
            COALESCE(SC.total_sales, 0) AS total_sales,
            COALESCE(MAX(PS.total_payments), 0) AS total_payments,
            COALESCE(PLA.ultimo_abono, 0) AS ultimo_abono
        FROM 
            customers C
        LEFT JOIN 
            Sales_Calculated SC ON C.id = SC.cliente_id
        LEFT JOIN 
            Payments_Sum PS ON C.id = PS.cliente_id
        LEFT JOIN 
            Payments_Last_Abono PLA ON C.id = PLA.cliente_id
        WHERE 
            C.id = $1
        GROUP BY 
            C.id, C.nombre, C.documento, C.telefono, SC.total_sales, PLA.ultimo_abono
    )
    SELECT
        CB.id, 
        CB.nombre, 
        CB.documento, 
        CB.telefono,
        CB.total_sales,
        CB.total_payments,
        CB.total_sales - CB.total_payments AS deuda_actual,
        CB.total_sales - (CB.total_payments - (CB.total_payments - CB.ultimo_abono)) AS deuda_antigua
    FROM 
        Customer_Balance CB
    ORDER BY 
        CB.id;
    `;

    const result = await db.oneOrNone(query, [clienteId]);
    return result ? result : { deuda_actual: 0, deuda_antigua: 0 };
};



module.exports = Payment;
