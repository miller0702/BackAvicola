const Sale = require("../models/sale");
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const db = require('../config/configPg');

const printer = new PdfPrinter({
  Roboto: {
    normal: path.join(__dirname, '../public/fonts/Roboto/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../public/fonts/Roboto/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../public/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../public/fonts/Roboto/Roboto-MediumItalic.ttf')
  }
});

const logoPath = path.join(__dirname, '../public/images/logo.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');


function formatearPrecio(precio) {
  const numeroPrecio = Number(precio);

  if (!isNaN(numeroPrecio) && isFinite(numeroPrecio)) {
    return `${numeroPrecio.toFixed(2)} USD`; 
  } else {
    console.log(`Error: ${precio} no es un número válido.`);
    return 'Precio no válido';
  }
}

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no válida'; 

  const fechaObj = new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha no válida';
  }
  
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0'); 
  const anio = fechaObj.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
}

module.exports = {

  async getAll(req, res, next) {
    try {
      const data = await Sale.getAll();
      console.log(`Facturas:`, data);
      return res.status(200).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener las facturas",
        error: error,
      });
    }
  },

  async register(req, res, next) {
    try {
      const sale = req.body;
      const data = await Sale.create(sale);

      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con exito",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al Registrar la Factura",
        error: error,
      });
    }
  },

  async update(req, res, next) {
    try {
      const sale = req.body;
      await Sale.update(sale);

      const updatedData = {
        id: req.body.id,
        cliente_id: req.body.cliente_id,
        lote_id: req.body.lote_id,
        user_id: req.body.user_id,
        cantidadaves: req.body.cantidadaves,
        canastas_vacias: req.body.canastas_vacias,
        canastas_llenas: req.body.canastas_llenas,
        preciokilo: req.body.preciokilo,
        fecha: req.body.fecha,
        numerofactura: req.body.numerofactura,
      };

      return res.status(200).json({
        success: true,
        message: "La factura se ha actualizado con éxito",
        data: updatedData,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la factura",
        error: error,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const saleId = req.params.id;
      await Sale.deleteById(saleId);

      return res.status(200).json({
        success: true,
        message: "La factura se ha eliminado con éxito",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la factura",
        error: error,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const saleId = req.params.id;
      const sale = await Sale.findById(saleId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la factura",
        });
      }

      return res.status(200).json(sale);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener la factura por ID",
        error: error,
      });
    }
  },

  async getTotalSale(req, res, next) {
    try {
      const totalSale = await Sale.getTotalSale();
      console.log(`Total de ventas: ${totalSale}`);
      return res.status(200).json(totalSale);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el total de ventas",
        error: error,
      });
    }
  },

  async getTotales(req, res, next) {
    try {
      const totales = await Sale.getTotales();
      console.log(`Totales`, totales);
      return res.status(200).json(totales);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los totales",
        error: error,
      });
    }
  },

  async generateInvoice(req, res, next) {
    try {
      const saleId = req.params.id;
      const sale = await Sale.findById(saleId);
  
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la factura",
        });
      }
  
      const cliente = await db.oneOrNone("SELECT * FROM customers WHERE id = $1", sale.cliente_id);
  
      const docDefinition = {
        content: [
          {
            image: `data:image/png;base64,${logoBase64}`,
            width: 100,
            alignment: 'right',
            margin: [0, 0, 0, 10]
          },
          {
            text: 'GRANJA DON RAFA LOTE BERMEJAL',
            style: 'header'
          },
          {
            text: 'VEREDA BERMEJAL KDX 1 A\nOCAÑA, NORTE DE SANTANDER\n310 767 2929 - 314 374 4532',
            style: 'subheader'
          },
          {
            text: `Recibo de Venta\nFecha: ${formatearFecha(sale.fecha)}`,
            style: 'title'
          },
          {
            columns: [
              {
                width: '*',
                text: `Cliente\nNombre: ${cliente ? cliente.nombre : 'Desconocido'}\nDocumento: ${sale.cliente_id}\nTeléfono: ${cliente ? cliente.telefono : 'Desconocido'}`,
                style: 'clientData'
              },
              {
                width: '*',
                text: `Cantidad de Aves: ${sale.cantidadaves}\nTotal Kilos: ${(sale.canastas_llenas - sale.canastas_vacias).toFixed(1)} kg\nPromedio Aves: ${(sale.promedio_aves).toFixed(2)} kg`,
                style: 'clientData'
              }
            ]
          },
          {
            style: 'tableExample',
            table: {
              widths: [100, 100, 100, '*', '*'],
              body: [
                [{ text: 'CANASTA VACIA', style: 'tableHeader' }, { text: 'CANASTA CON POLLO', style: 'tableHeader' }, { text: 'PRECIO KILO', style: 'tableHeader' }, { text: 'PRECIO TOTAL', style: 'tableHeader' }],
                [sale.canastas_vacias, sale.canastas_llenas, `$${sale.preciokilo}`, `$${((sale.canastas_llenas - sale.canastas_vacias) * sale.preciokilo).toFixed(2)}`]
              ]
            }
          },
          {
            text: `TOTAL: $${((sale.canastas_llenas - sale.canastas_vacias) * sale.preciokilo).toFixed(2)}`,
            style: 'total'
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 10, 0, 10]
          },
          subheader: {
            fontSize: 14,
            alignment: 'center',
            margin: [0, 5, 0, 5]
          },
          title: {
            fontSize: 16,
            bold: true,
            alignment: 'center',
            margin: [0, 5, 0, 10]
          },
          clientData: {
            fontSize: 12,
            margin: [0, 10, 0, 10]
          },
          tableExample: {
            margin: [0, 10, 0, 10]
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
          },
          total: {
            fontSize: 16,
            bold: true,
            alignment: 'right',
            margin: [0, 10, 0, 10]
          }
        }
      };
  
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura_${saleId}.pdf`);
      pdfDoc.pipe(res);
      pdfDoc.end();
  
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener la factura por ID",
        error: error,
      });
    }
  }
  

};
