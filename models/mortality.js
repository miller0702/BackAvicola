const db = require('../config/config');


const Mortality = {};

Mortality.getAll = () => {
    const sql = 'SELECT * FROM mortality;';
    return db.manyOrNone(sql);
};

Mortality.findById = (id, callback) => {
    const sql = `
    SELECT
        id
        cantidadhembra,
        cantidadmacho,
        fecha,    
    FROM
        mortality
    WHERE
        id=$1`
    return db.oneOrNone(sql, id).then(mortality => { callback(null, mortality); });
}


Mortality.updateCantidadHembra = (mortality) => {
    const sql=`
    UPDATE 
        mortality
    SET
        cantidadhembra=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [mortality.email,mortality.id]);
}

Mortality.updateCantidadMacho = (mortality) => {
    const sql=`
    UPDATE 
        mortality
    SET
        cantidadmacho=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [mortality.name,mortality.id]);
}

Mortality.create = (mortality) => {

    const sql = `
    INSERT INTO
        mortality(
            cantidadhembra,
            cantidadmacho,
            fecha,  
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5) RETURNING id
    `;
    return db.oneOrNone(sql, [
        mortality.cantidadhembra,
        mortality.cantidadmacho,
        mortality.fecha,
        new Date(),
        new Date()
    ]);
};


module.exports = Mortality;

