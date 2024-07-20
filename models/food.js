const db = require('../config/configPg.js');


const Food = {};

Food.getAll = () => {
  const sql = 'SELECT * FROM food;';
  return db.manyOrNone(sql);
};

Food.findById = (id, callback) => {
  const sql = `
    SELECT
        id,
        lote_id,
        cantidadhembra,
        cantidadmacho,
        fecha,    
    FROM
        food
    WHERE
        id=$1`
  return db.oneOrNone(sql, id).then(food => { callback(null, food); });
}

Food.delete = async (id) => {
  const sql = `
      DELETE FROM
        food
      WHERE
        id=$1
    `;
  await db.none(sql, id);
};

Food.update = async (food) => {
  const sql = `
      UPDATE
        food
      SET
        lote_id=$1,
        cantidadhembra=$2,
        cantidadmacho=$3,
        fecha=$4,
        updated_at=$5
      WHERE
        id=$6
    `;
  await db.none(sql, [food.lote_id, food.cantidadhembra, food.cantidadmacho, food.fecha, new Date(), food.id]);
};

Food.updateCantidadHembra = (food) => {
  const sql = `
    UPDATE 
        food
    SET
        cantidadhembra=$1
    WHERE 
        id=$2;`
  return db.oneOrNone(sql, [food.cantidadhembra, food.id]);
}

Food.updateCantidadMacho = (food) => {
  const sql = `
    UPDATE 
        food
    SET
        cantidadmacho=$1
    WHERE 
        id=$2;`
  return db.oneOrNone(sql, [food.cantidadmacho, food.id]);
}

Food.create = (food) => {

  const sql = `
    INSERT INTO
        food(
            lote_id,
            cantidadhembra,
            cantidadmacho,
            fecha,  
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5, $6) RETURNING id
    `;
  return db.oneOrNone(sql, [
    food.lote_id,
    food.cantidadhembra,
    food.cantidadmacho,
    food.fecha,
    new Date(),
    new Date()
  ]);
};

Food.getTotalFood = () => {
  const sql = `
      SELECT
          SUM(cantidadhembra) + SUM(cantidadmacho) AS totalfood
      FROM
          food;
  `;
  return db.oneOrNone(sql);
};


Food.getFoodByDay = () => {
  const sql = `
       SELECT
    d.fecha,
    COALESCE(SUM(food.cantidadmacho), 0) AS totalMachos,
    COALESCE(SUM(food.cantidadhembra), 0) AS totalHembras
FROM
    (
        SELECT generate_series(date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date, '1 day'::interval) AS fecha
    ) AS d
LEFT JOIN
    food ON food.fecha::date = d.fecha
GROUP BY
    d.fecha
ORDER BY
    d.fecha;
    `;
  return db.manyOrNone(sql);
};

module.exports = Food;