const db = require('../config/config');


const Supplies = {};

Supplies.getAll = () => {
    const sql = 'SELECT * FROM supplies;';
    return db.manyOrNone(sql);
};

Supplies.findById = (id, callback) => {
    const sql = `
    SELECT
        id
        proveedor,
        descripcioncompra,
        preciocompra,
        fecha,    
    FROM
        supplies
    WHERE
        id=$1`
    return db.oneOrNone(sql, id).then(supplies => { callback(null, supplies); });
}


Supplies.updateProveedor = (supplies) => {
    const sql=`
    UPDATE 
        supplies
    SET
        proveedor=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [supplies.email,supplies.id]);
}

Supplies.updateDescripcionCompra = (supplies) => {
    const sql=`
    UPDATE 
        supplies
    SET
        descripcioncompra=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [supplies.email,supplies.id]);
}

Supplies.updatePrecioCompra = (supplies) => {
    const sql=`
    UPDATE 
        supplies
    SET
        preciocompra=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [supplies.name,supplies.id]);
}

Supplies.create = (supplies) => {

    const sql = `
    INSERT INTO
        supplies(
            proveedor,
            descripcioncompra,
            preciocompra,
            fecha,  
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id
    `;
    return db.oneOrNone(sql, [
        supplies.proveedor,
        supplies.descripcioncompra,
        supplies.preciocompra,
        supplies.fecha,
        new Date(),
        new Date()
    ]);
};


module.exports = Supplies;

