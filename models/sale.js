const db = require('../config/configPg.js');


const Sale = {};

Sale.getAll = () => {
    const sql = 'SELECT * FROM sale;';
    return db.manyOrNone(sql);
};

Sale.findById = (id, callback) => {
    const sql = `
    SELECT
        id,
        cliente,
        clientecorreo,
        vendedor,
        cantidadaves,
        cantidadkilos,
        preciokilo,
        fecha, 
        numerofactura   
    FROM
        sale
    WHERE
        id=$1`
    return db.oneOrNone(sql, id).then(sale => { callback(null, sale); });
}

Sale.create = (sale) => {

    const sql = `
    INSERT INTO
        sale(
            cliente,
            clientecorreo,
            vendedor,
            cantidadaves,
            cantidadkilos,
            preciokilo,
            fecha,
            numerofactura,
            created_at,
            updated_at  
        )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id
    `;
    return db.oneOrNone(sql, [
        sale.cliente,
        sale.clientecorreo,
        sale.vendedor,
        sale.cantidadaves,
        sale.cantidadkilos,
        sale.preciokilo,
        sale.fecha,
        sale.numerofactura,
        new Date(),
        new Date()
    ]);
};

Sale.deleteById = async (id) => {
    const sql = `
      DELETE FROM
        sale
      WHERE
        id=$1
    `;
    await db.none(sql, id);
};

Sale.update = async (sale) => {
    const sql = `
      UPDATE
        sale
      SET
        cliente=$1,
        clientecorreo=$2,
        vendedor=$3,
        cantidadaves=$4,
        cantidadkilos=$5,
        preciokilo=$6,
        fecha=$7,    
        numerofactura=$8
        updated_at=$9
      WHERE
        id=$10
    `;
    await db.none(sql, [sale.cliente,
    sale.clientecorreo,
    sale.vendedor,
    sale.cantidadaves,
    sale.cantidadkilos,
    sale.preciokilo,
    sale.fecha,
    sale.numerofactura,
    new Date(),
    sale.id]);


};

Sale.findByNumeroFactura = (numeroFactura) => {
    // console.log(numeroFactura)
    const sql = `
    SELECT
        id,
        cliente,
        clientecorreo,
        vendedor,
        cantidadaves,
        cantidadkilos,
        preciokilo,
        fecha, 
        numerofactura   
    FROM
        sale
    WHERE
    numerofactura=$1`
    return db.oneOrNone(sql, numeroFactura).then(result => {
        return result;
    });
}
Sale.getTotalSale = () => {
    const sql = `
    SELECT ROUND(SUM(total)) AS totalGeneral FROM (SELECT cantidadkilos * preciokilo AS total FROM sale) AS subquery;;
    `;
    return db.oneOrNone(sql);
};

Sale.getTotales = () => {
    const sql = `
    SELECT
  SUM(supplies.preciocompra)::numeric AS totalcompras,
  ROUND(SUM(subquery.total)::numeric) AS totalGeneral
FROM
  supplies
CROSS JOIN
  (SELECT cantidadkilos * preciokilo AS total FROM sale) AS subquery;
    `;
    return db.oneOrNone(sql);
};


module.exports = Sale;