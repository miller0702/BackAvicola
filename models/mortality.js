const db = require('../config/configPg.js');

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

Mortality.delete = async (id) => {
    const sql = `
      DELETE FROM
        mortality
      WHERE
        id=$1
    `;
    await db.none(sql, id);
};

Mortality.update = async (mortality) => {
    const sql = `
      UPDATE
        mortality
      SET
        cantidadhembra=$1,
        cantidadmacho=$2,
        fecha=$3,
        updated_at=$4
      WHERE
        id=$5
    `;
    await db.none(sql, [mortality.cantidadhembra, mortality.cantidadmacho, mortality.fecha, new Date(), mortality.id]);
};

Mortality.updateCantidadHembra = (mortality) => {
    const sql = `
    UPDATE 
        mortality
    SET
        cantidadhembra=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [mortality.email, mortality.id]);
}

Mortality.updateCantidadMacho = (mortality) => {
    const sql = `
    UPDATE 
        mortality
    SET
        cantidadmacho=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [mortality.name, mortality.id]);
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

Mortality.getTotalMortality = () => {
    const sql = `
        SELECT
            SUM(cantidadhembra) + SUM(cantidadmacho) AS totalmortality
        FROM
            mortality;
    `;
    return db.oneOrNone(sql);
};

Mortality.getMortalitiesByDay = () => {
    const sql = `
    SELECT
    d.fecha,
    COALESCE(SUM(mortality.cantidadmacho), 0) AS totalMachos,
    COALESCE(SUM(mortality.cantidadhembra), 0) AS totalHembras
FROM
    (
        SELECT generate_series(date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date, '1 day'::interval) AS fecha
    ) AS d
LEFT JOIN
    mortality ON mortality.fecha::date = d.fecha
GROUP BY
    d.fecha
ORDER BY
    d.fecha;


    `;
    return db.manyOrNone(sql);
};

module.exports = Mortality;