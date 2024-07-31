const Sale = require("../models/sale");
const Payment = require("../models/payment");
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const db = require('../config/configPg');
const { title } = require("process");

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

const headerImagePath = path.join(__dirname, '../public/images/header.png');
const footerImagePath = path.join(__dirname, '../public/images/footer.png');

const headerImageBase64 = `data:image/png;base64,${fs.readFileSync(headerImagePath).toString('base64')}`;
const footerImageBase64 = `data:image/png;base64,${fs.readFileSync(footerImagePath).toString('base64')}`;


function formatearPrecio(precio) {
  const numeroPrecio = Number(precio);

  if (!isNaN(numeroPrecio) && isFinite(numeroPrecio)) {
    return numeroPrecio.toLocaleString('es-CO', { style: 'currency', currency: 'COP', });
  } else {
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
      return res.status(200).json(data);
    } catch (error) {
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
      return res.status(200).json(totalSale);
    } catch (error) {
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
      return res.status(200).json(totales);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los totales",
        error: error,
      });
    }
  },

  async getSaleForDay(req, res, next) {
    try {
      const ventasPorDia = await Sale.getSaleForDay();
      return res.status(200).json(ventasPorDia);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las ventas por día",
        error: error,
      });
    }
  },

  async getSaleForDayCustomer(req, res, next) {
    try {
      const saleForDay = await Sale.getSaleForDayCustomer();
      return res.status(200).json(saleForDay);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las compras por día",
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

      const totalCanastasVacias = sale.canastas_vacias.reduce((acc, val) => acc + val, 0);
      const totalCanastasLlenas = sale.canastas_llenas.reduce((acc, val) => acc + val, 0);
      const precioTotal = (totalCanastasLlenas - totalCanastasVacias) * sale.preciokilo;

      const canastasVaciasKg = sale.canastas_vacias.map(value => `${value} kg`);
      const canastasLlenasKg = sale.canastas_llenas.map(value => `${value} kg`);

      // Obtener la deuda actual del cliente
      const fechaActual = new Date();
      const deudaInfo = await Payment.getDeudaActual(sale.cliente_id, fechaActual);

      const docDefinition = {
        pageMargins: [30, 80, 30, 100],
        header: {
          image: headerImageBase64,
          width: 595,
          height: 80,
          alignment: 'center',
          margin: [0, 0, 0, 0]
        },
        footer: function (currentPage, pageCount) {
          return {
            image: footerImageBase64,
            width: 595,
            height: 80,
            alignment: 'center',
            margin: [0, 20, 0, 0],
          };
        },
        content: [
          {
            columns: [
              {
                stack: [
                  {
                    text: 'GRANJA DON RAFA LOTE BERMEJAL',
                    style: 'header'
                  },
                  {
                    text: 'VEREDA BERMEJAL KDX 1 A\nOCAÑA, NORTE DE SANTANDER\n310 767 2929 - 314 374 4532',
                    style: 'subheader'
                  },
                  {
                    text: `Recibo de Venta: ${sale.numerofactura}\n`,
                    style: 'title'
                  },
                  {
                    text: `Fecha: ${formatearFecha(sale.fecha)}`,
                    style: 'date'
                  },
                  {
                    text: 'Detalles de la Compra',
                    style: 'title2'
                  },
                ]
              },
              {
                image: `data:image/png;base64,${logoBase64}`,
                width: 100,
                alignment: 'right',
                margin: [0, 0, 0, 20]
              }
            ]
          },
          {
            columns: [
              {
                width: '*',
                text: [
                  { text: 'Nombre: ', bold: true, margin: [0, 0, 0, 5] },
                  `${cliente ? cliente.nombre : 'Desconocido'}\n`,
                  { text: 'Documento: ', bold: true, margin: [0, 0, 0, 5] },
                  `${cliente ? cliente.documento : 'Desconocido'}\n`,
                  { text: 'Teléfono: ', bold: true, margin: [0, 0, 0, 5] },
                  `${cliente ? cliente.telefono : 'Desconocido'}\n`,
                  { text: 'Total Abonado: ', bold: true, margin: [0, 0, 0, 5] },
                  `${formatearPrecio(deudaInfo.total_payments)}`
                ],
                style: 'clientData'
              },
              {
                width: '*',
                text: [
                  { text: 'Cantidad de Aves: ', bold: true, margin: [0, 0, 0, 5] },
                  `${sale.cantidadaves}\n`,
                  { text: 'Total Kilos: ', bold: true, margin: [0, 0, 0, 5] },
                  `${(totalCanastasLlenas - totalCanastasVacias).toFixed(1)} kg\n`,
                  { text: 'Promedio Aves: ', bold: true, margin: [0, 0, 0, 5] },
                  `${((totalCanastasLlenas - totalCanastasVacias) / sale.cantidadaves).toFixed(1)} kg\n`,
                  { text: 'Deuda Actual: ', bold: true, margin: [0, 0, 0, 5] },
                  `${formatearPrecio(deudaInfo.deuda_actual)}`
                ],
                style: 'clientData'
              }
            ]
          },
          {
            style: 'tableExample',
            table: {
              widths: ['*', '*', 80, 100],
              body: [
                [
                  { text: 'CANASTA VACIA', style: 'tableHeader' },
                  { text: 'CANASTA CON POLLO', style: 'tableHeader' },
                  { text: 'PRECIO KILO', style: 'tableHeader' },
                  { text: 'PRECIO TOTAL', style: 'tableHeader' }
                ],
                [
                  { text: `Total Vacias: ${totalCanastasVacias.toFixed(1)} kg`, style: 'textos' },
                  { text: `Total Llenas: ${totalCanastasLlenas.toFixed(1)} kg`, style: 'textos' },
                  { text: `${formatearPrecio(sale.preciokilo)}`, style: 'textos' },
                  { text: `${formatearPrecio(precioTotal.toFixed(0))}`, style: 'textos' }
                ],
                ...sale.canastas_vacias.map((canastaVacia, index) => ([
                  { text: `${canastaVacia} kg`, fillColor: index % 2 === 0 ? '#fce5cd' : null, style: 'textos' },
                  { text: `${canastasLlenasKg[index] || ''}`, fillColor: index % 2 === 0 ? '#fce5cd' : null, style: 'textos' },
                  {},
                  {}
                ])),
              ]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 4,
              paddingBottom: () => 4,
              fillColor: (rowIndex) => (rowIndex % 2 === 0) ? '#fce5cd' : null
            }
          },
          {
            text: [
              { text: 'Valor Total Factura: ', bold: true },
              formatearPrecio((precioTotal).toFixed(0))
            ],
            style: 'total'
          },
        ],
        styles: {
          header: {
            fontSize: 22,
            color: "#ff9900",
            bold: true,
            alignment: 'left',
            margin: [0, 10, 0, 10]
          },
          subheader: {
            fontSize: 12,
            alignment: 'left',
            margin: [0, 5, 0, 5]
          },
          title: {
            fontSize: 20,
            bold: true,
            color: "#ff9900",
            alignment: 'left',
            margin: [0, 5, 0, 0]
          },
          date: {
            fontSize: 12,
            bold: true,
            color: "#ff0000",
            alignment: 'left',
            margin: [0, 5, 0, 10]
          },
          title2: {
            fontSize: 13,
            bold: true,
            alignment: 'left',
          },
          clientData: {
            fontSize: 12,
            margin: [0, 10, 10, 10]
          },
          tableExample: {
            margin: [0, 10, 0, 10],
            border: "none"
          },
          tableHeader: {
            bold: true,
            color: "#ff9900",
            fontSize: 13,
            color: 'black',
            alignment: 'center'
          },
          textos: {
            alignment: 'center',
          },
          total: {
            fontSize: 16,
            bold: true,
            color: "#ff9900",
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
      return res.status(500).json({
        success: false,
        message: "Error al obtener la factura por ID",
        error: error,
      });
    }
  }

};
