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
            width: 150,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Factura',
            style: 'header'
          },
          {
            columns: [
              [
                { text: 'GRANJA DON RAFA BERMEJAL', style: 'companyName' },
                { text: 'DIRECCIÓN: VEREDA BERMEJAL KDX 1 A', style: 'address' },
                { text: 'Teléfono: 310 767 2929 - 314 374 4532', style: 'phone' },
                { text: 'OCAÑA, NORTE DE SANTANDER', style: 'email' }
              ],
              {
                text: [
                  { text: `Número de Factura: ${sale.numerofactura}\n`, style: 'invoiceNumber' },
                  { text: `Fecha: ${sale.fecha}\n`, style: 'date' }
                ],
                alignment: 'right'
              }
            ]
          },
          {
            text: 'Datos del Cliente',
            style: 'subheader'
          },
          {
            columns: [
              [
                { text: `Nombre: ${cliente ? cliente.nombre : 'Desconocido'}`, style: 'clientInfo' },
                { text: `Teléfono: ${cliente ? cliente.telefono : 'Desconocido'}`, style: 'clientInfo' }
              ],
              {
                text: [
                  { text: `Vendedor: ${sale.user_id}\n`, style: 'clientInfo' },
                  { text: `Cantidad de Aves: ${sale.cantidadaves}\n`, style: 'clientInfo' },
                  { text: `Cantidad de Kilos: ${sale.canastas_llenas - sale.canastas_vacias}\n`, style: 'clientInfo' },
                  { text: `Precio por Kilo: ${sale.preciokilo}\n`, style: 'clientInfo' },
                  { text: `Total: ${(sale.canastas_llenas - sale.canastas_vacias) * sale.preciokilo}`, style: 'clientInfo' }
                ],
                alignment: 'right'
              }
            ]
          },
          {
            text: 'Detalles de la Factura',
            style: 'subheader'
          },
          {
            table: {
              widths: [ '*', '*', '*' ],
              body: [
                [ 'Descripción', 'Cantidad', 'Precio' ],
                [ 'Aves', sale.cantidadaves, formatearPrecio(sale.preciokilo) ],
                [ 'Kilos', sale.canastas_llenas - sale.canastas_vacias, formatearPrecio(sale.preciokilo) ]
              ]
            },
            layout: 'lightHorizontalLines'
          },
          {
            text: 'Notas:',
            style: 'notes'
          },
          {
            text: 'Gracias por su compra!',
            style: 'footer'
          }
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          companyName: {
            fontSize: 18,
            bold: true
          },
          address: {
            fontSize: 12
          },
          phone: {
            fontSize: 12
          },
          email: {
            fontSize: 12
          },
          invoiceNumber: {
            fontSize: 14,
            bold: true
          },
          date: {
            fontSize: 14
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 20, 0, 10]
          },
          clientInfo: {
            fontSize: 12
          },
          notes: {
            fontSize: 12,
            margin: [0, 20, 0, 10]
          },
          footer: {
            fontSize: 12,
            italics: true,
            alignment: 'center',
            margin: [0, 20, 0, 0]
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
  },

};

function formatearPrecio(precio) {
  return `${precio.toFixed(2)} USD`; 
}