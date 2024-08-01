const Discount = require("../models/discount");
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

function formatearMes(mes) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes];
}

module.exports = {

  async getAll(req, res, next) {
    try {
      const data = await Discount.getAll();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las descuentos",
        error: error,
      });
    }
  },

  async register(req, res, next) {
    try {
      const discount = req.body;
      const data = await Discount.create(discount);

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
      const discount = req.body;
      await Discount.update(discount);

      const updatedData = {
        id: req.body.id,
        cliente_id: req.body.cliente_id,
        lote_id: req.body.lote_id,
        numerofactura: req.body.numerofactura,
        descripcion: req.body.descripcion,
        valor: req.body.valor,
        fecha: req.body.fecha,
      };

      return res.status(200).json({
        success: true,
        message: "La descuento se ha actualizado con éxito",
        data: updatedData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la descuento",
        error: error,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const discountId = req.params.id;
      await Discount.deleteById(discountId);

      return res.status(200).json({
        success: true,
        message: "La descuento se ha eliminado con éxito",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la descuento",
        error: error,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const discountId = req.params.id;
      const discount = await Discount.findById(discountId);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la descuento",
        });
      }

      return res.status(200).json(discount);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener la descuento por ID",
        error: error,
      });
    }
  },

  async getTotalDiscount(req, res, next) {
    try {
      const totalDiscount = await Discount.getTotalDiscount();
      return res.status(200).json(totalDiscount);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el total de descuentos",
        error: error,
      });
    }
  },

  async getTotales(req, res, next) {
    try {
      const totales = await Discount.getTotales();
      return res.status(200).json(totales);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los totales",
        error: error,
      });
    }
  },

  async generateInvoice(req, res, next) {
    try {
      const discountId = req.params.id;
      const discount = await Discount.findById(discountId);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message: "No se encontró el descuento",
        });
      }

      const cliente = await db.oneOrNone("SELECT * FROM customers WHERE id = $1", discount.cliente_id);

      const fechaActual = new Date();
      const deudaInfo = await Discount.getDeudaActual(discount.cliente_id, fechaActual);

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
                    text: `Recibo de Abono: ${discount.numerofactura}\n`,
                    style: 'title'
                  },
                  {
                    text: `Fecha: ${formatearFecha(discount.fecha)}`,
                    style: 'date'
                  },
                  {
                    text: 'Detalles del Abono',
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
                  `${cliente ? cliente.telefono : 'Desconocido'}`
                ],
                style: 'clientData'
              },
              {
                width: '*',
                text: [
                  { text: 'Monto del Abono: ', bold: true, margin: [0, 0, 0, 5] },
                  `${formatearPrecio(discount.valor)}\n`,
                  { text: 'Saldo Anterior: ', bold: true, margin: [0, 0, 0, 5] },
                  `${formatearPrecio(deudaInfo.deuda_antigua)}\n`,
                  { text: 'Saldo Actual: ', bold: true, margin: [0, 0, 0, 5] },
                  `${formatearPrecio(deudaInfo.deuda_actual)}`
                ],
                style: 'clientData'
              }
            ]
          },
          {
            text: [
              { text: 'Descripción: ', bold: true, margin: [0, 0, 0, 10] },
              `A los ${new Date(discount.fecha).getDate()} días del mes de ${formatearMes(new Date(discount.fecha).getMonth())} se hace entrega de un descuento por el valor de ${formatearPrecio(discount.valor)}`
            ],
            style: 'description'
          },
          {
            text: [
              { text: 'Valor Total Abonado: ', bold: true },
              formatearPrecio((discount.valor).toFixed(0))
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
          description: {
            fontSize: 12,
            margin: [0, 10, 0, 10]
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
      res.setHeader('Content-Disposition', `attachment; filename=factura_${discountId}.pdf`);
      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el descuento por ID",
        error: error,
      });
    }
  }

};
