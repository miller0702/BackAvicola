const db = require('../config/config');


const Food = {};

Food.getAll = () => {
    const sql = 'SELECT * FROM food;';
    return db.manyOrNone(sql);
};

Food.findById = (id, callback) => {
    const sql = `
    SELECT
        id
        cantidadhembra,
        cantidadmacho,
        fecha,    
    FROM
        food
    WHERE
        id=$1`
    return db.oneOrNone(sql, id).then(food => { callback(null, food); });
}


Food.updateCantidadHembra = (food) => {
    const sql=`
    UPDATE 
        food
    SET
        cantidadhembra=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [food.email,food.id]);
}

Food.updateCantidadMacho = (food) => {
    const sql=`
    UPDATE 
        food
    SET
        cantidadmacho=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [food.name,food.id]);
}

Food.create = (food) => {

    const sql = `
    INSERT INTO
        food(
            cantidadhembra,
            cantidadmacho,
            fecha,  
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5) RETURNING id
    `;
    return db.oneOrNone(sql, [
        food.cantidadhembra,
        food.cantidadmacho,
        food.fecha,
        new Date(),
        new Date()
    ]);
};


module.exports = Food;

