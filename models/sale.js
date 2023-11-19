const db = require('../config/config');


const Sale = {};

Sale.getAll = () => {
    const sql = 'SELECT * FROM sale;';
    return db.manyOrNone(sql);
};

Sale.findById = (id, callback) => {
    const sql = `
    SELECT
        id
        id_client,
        cantidadpollo,
        cantidadkilos,
        preciokilo,
        fecha,    
    FROM
        sale
    WHERE
        id=$1`
    return db.oneOrNone(sql, id).then(sale => { callback(null, sale); });
}


Sale.updateCantidadPollo = (sale) => {
    const sql=`
    UPDATE 
        sale
    SET
        cantidadpollo=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [sale.email,sale.id]);
}

Sale.updateIdClient = (sale) => {
    const sql=`
    UPDATE 
        sale
    SET
        id_client=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [sale.email,sale.id]);
}

Sale.updateCantidadKilos = (sale) => {
    const sql=`
    UPDATE 
        sale
    SET
        cantidadkilos=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [sale.name,sale.id]);
}

Sale.updatePrecioKilo = (sale) => {
    const sql=`
    UPDATE 
        sale
    SET
        preciokilo=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [sale.name,sale.id]);
}

Sale.create = (sale) => {

    const sql = `
    INSERT INTO
        sale(
            id_client,
            cantidadpollo,
            cantidadkilos,
            preciokilo,
            fecha,  
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id
    `;
    return db.oneOrNone(sql, [
        sale.id_client,
        sale.cantidadpollo,
        sale.cantidadkilos,
        sale.cantidadprecio,
        sale.fecha,
        new Date(),
        new Date()
    ]);
};


module.exports = Sale;

