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

module.exports = Customer;
