const db = require('../config/configPg.js');

const Mortality = {};

Mortality.getAll = () => {
    const sql = 'SELECT * FROM mortality;';
    return db.manyOrNone(sql);
};

Mortality.findById = (id, callback) => {
    const sql = `
    SELECT
        id,
        lote_id,
        cantidadhembra,
        cantidadmacho,
        fecha,    
    FROM
        mortality
    WHERE
        id=$1`
    return db.oneOrNone(sql, id).then(mortality => { callback(null, mortality); });
};

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
        lote_id=$1,
        cantidadhembra=$2,
        cantidadmacho=$3,
        fecha=$4,
        updated_at=$5
      WHERE
        id=$6
    `;
    await db.none(sql, [mortality.lote_id, mortality.cantidadhembra, mortality.cantidadmacho, mortality.fecha, new Date(), mortality.id]);
};

Mortality.updateCantidadHembra = (mortality) => {
    const sql = `
    UPDATE 
        mortality
    SET
        cantidadhembra=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [mortality.cantidadhembra, mortality.id]);
}

Mortality.updateCantidadMacho = (mortality) => {
    const sql = `
    UPDATE 
        mortality
    SET
        cantidadmacho=$1
    WHERE 
        id=$2;`
    return db.oneOrNone(sql, [mortality.cantidadmacho, mortality.id]);
}

Mortality.create = (mortality) => {

    const sql = `
    INSERT INTO
        mortality(
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
        mortality.lote_id,
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
            COALESCE( SUM(m.cantidadhembra) + SUM(m.cantidadmacho), 0 )AS totalmortality
        FROM mortality m
            JOIN lote l ON m.lote_id = l.id
        WHERE l.estado = 'activo';
    `;
    return db.oneOrNone(sql);
};

Mortality.getMortalitiesByDay = () => {
    const sql = `
    WITH lotes_activos AS (
    SELECT id
    FROM lote
    WHERE estado = 'activo'
    ),
    mortality_filtrada AS (
        SELECT
            *
        FROM
            mortality
        WHERE lote_id IN (SELECT id FROM lotes_activos)
    )
    SELECT
        d.fecha,
        COALESCE(SUM(mortality_filtrada.cantidadmacho), 0) AS totalMachos,
        COALESCE(SUM(mortality_filtrada.cantidadhembra), 0) AS totalHembras
    FROM
        (
            SELECT generate_series(date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date, '1 day'::interval) AS fecha
        ) AS d
    LEFT JOIN
        mortality_filtrada ON mortality_filtrada.fecha::date = d.fecha
    GROUP BY
        d.fecha
    HAVING
        COUNT(mortality_filtrada.cantidadmacho) > 0
    ORDER BY
        d.fecha;

    `;
    return db.manyOrNone(sql);
};

module.exports = Mortality;