const db = require('../config/configPg.js');

const Customer = {};

Customer.getAll = () => {
    const sql = 'SELECT * FROM customers;';
    return db.manyOrNone(sql);
};

Customer.findById = (id) => {
    const sql = `
    SELECT
        id,
        nombre,
        telefono,
        documento
    FROM
        customers
    WHERE
        id=$1
    `;
    return db.oneOrNone(sql, id);
};

Customer.create = (customer) => {
    const sql = `
    INSERT INTO
        customers(
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
        customer.nombre,
        customer.telefono,
        customer.documento,
        new Date(),
        new Date()
    ]);
};

Customer.update = (customer) => {
    const sql = `
    UPDATE
        customers
    SET
        nombre=$1,
        telefono=$2,
        documento=$3,
        updated_at=$4
    WHERE
        id=$5
    `;
    return db.none(sql, [
        customer.nombre,
        customer.telefono,
        customer.documento,
        new Date(),
        customer.id
    ]);
};

Customer.delete = (id) => {
    const sql = `
    DELETE FROM
        customers
    WHERE
        id=$1
    `;
    return db.none(sql, id);
};

Customer.getTotalCustomers = () => {
    const sql = `
        SELECT COUNT(DOCUMENTO)AS totalcustomers FROM customers;
    `;
    return db.oneOrNone(sql);
};
Customer.getCustomers = async () => {
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
        S.cliente_id = '5'
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
        P.cliente_id = '5'
),
Payments_Last_Abono AS (
    SELECT 
        P.cliente_id,
        MAX(P.fecha) AS fecha_ultima,
        (SELECT valor FROM payments WHERE cliente_id = P.cliente_id ORDER BY fecha DESC LIMIT 1) AS ultimo_abono
    FROM 
        payments P
    WHERE 
        P.cliente_id = '5'
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
        C.id = '5'
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

    const result = await db.any(query); // Usa `any` para múltiples resultados
    return result;
};



module.exports = Customer;
