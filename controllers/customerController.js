const Customer = require("../models/customer");
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
      const customers = await Customer.getAll();
      console.log("Clientes:", customers);
      return res.status(200).json(customers);
    } catch (error) {
      console.error(`Error al obtener clientes: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los clientes",
        error: error.message,
      });
    }
  },

  async getCustomers(req, res, next) {
    try {
        const customers = await Customer.getCustomers();
        console.log("Clientes:", customers);
        return res.status(200).json(customers);
    } catch (error) {
        console.error(`Error al obtener clientes: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error al obtener los clientes",
            error: error.message,
        });
    }
},


  async register(req, res, next) {
    try {
      const { id, nombre, telefono, documento } = req.body;
      const newCustomer = { id, nombre, telefono, documento };
      const createdCustomer = await Customer.create(newCustomer);

      return res.status(201).json({
        success: true,
        message: "Cliente registrado correctamente",
        data: createdCustomer,
      });
    } catch (error) {
      console.error(`Error al registrar cliente: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al registrar el cliente",
        error: error.message,
      });
    }
  },

  async update(req, res, next) {
    try {
      const { id, nombre, telefono, documento } = req.body;
      const updatedCustomer = await Customer.update({ id, nombre, telefono, documento });

      return res.status(200).json({
        success: true,
        message: "Cliente actualizado correctamente",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error(`Error al actualizar cliente: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el cliente",
        error: error.message,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const customerId = req.params.id;
      await Customer.delete(customerId);

      return res.status(200).json({
        success: true,
        message: "Cliente eliminado correctamente",
      });
    } catch (error) {
      console.error(`Error al eliminar cliente: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el cliente",
        error: error.message,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const customerId = req.params.id;
      const customer = await Customer.getById(customerId);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error(`Error al obtener cliente por ID: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el cliente por ID",
        error: error.message,
      });
    }
  },

  async getTotalCustomers(req, res, next) {
    try {
      const totalCustomersResult = await Customer.getTotalCustomers();
      const totalCustomers = totalCustomersResult.totalcustomers ? parseInt(totalCustomersResult.totalcustomers, 10) : 0;
      console.log(`Total de Clientes:`,totalCustomers);
      return res.status(200).json({ totalCustomers: totalCustomers });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el total de clientes",
        error: error,
      });
    }
  },

  async generateInvoice(req, res, next) {
    try {
      const clienteId = req.params.id;
      const cliente = await db.oneOrNone("SELECT * FROM customers WHERE id = $1", clienteId);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: "No se encontró el cliente",
        });
      }

      const ventas = await db.any("SELECT * FROM sales WHERE cliente_id = $1", clienteId);

      const totalCanastasVacias = ventas.reduce((acc, sale) => acc + sale.canastas_vacias.reduce((acc, val) => acc + val, 0), 0);
      const totalCanastasLlenas = ventas.reduce((acc, sale) => acc + sale.canastas_llenas.reduce((acc, val) => acc + val, 0), 0);
      const precioTotal = ventas.reduce((acc, sale) => acc + ((sale.canastas_llenas.reduce((acc, val) => acc + val, 0) - sale.canastas_vacias.reduce((acc, val) => acc + val, 0)) * sale.preciokilo), 0);

      const fechaActual = new Date();
      const deudaInfo = await Payment.getDeudaActual(clienteId, fechaActual);

      const docDefinition = {
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
            margin: [0 ,-30, 0, 0],
          };
        },
        content: [
          {
            canvas: [
              { type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, color: '#ff9900' }
            ],
            margin: [0, 30, 0, 10]
          },
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
                    text: `Fecha: ${formatearFecha(new Date())}`,
                    style: 'date'
                  },
                  {
                    text: 'Detalles de las Compras',
                    style: 'title'
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
                  `${cliente.nombre}\n`,
                  { text: 'Documento: ', bold: true, margin: [0, 0, 0, 5] },
                  `${cliente.documento}\n`,
                  { text: 'Teléfono: ', bold: true, margin: [0, 0, 0, 5] },
                  `${cliente.telefono}\n`,
                  { text: 'Total Abonado: ', bold: true, margin: [0, 0, 0, 5] },
                  `${formatearPrecio(deudaInfo.total_payments)}`
                ],
                style: 'clientData'
              },
              {
                width: '*',
                text: [
                  { text: 'Total Kilos Llenos: ', bold: true, margin: [0, 0, 0, 5] },
                  `${totalCanastasLlenas.toFixed(1)} kg\n`,
                  { text: 'Total Kilos Vacíos: ', bold: true, margin: [0, 0, 0, 5] },
                  `${totalCanastasVacias.toFixed(1)} kg\n`,
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
              widths: [70, 70, 100, 100, 100],
              body: [
                [
                  { text: 'FACTURA', style: 'tableHeader' },
                  { text: 'FECHA', style: 'tableHeader' },
                  { text: 'TOTAL KILOS', style: 'tableHeader' },
                  { text: 'PRECIO KILO', style: 'tableHeader' },
                  { text: 'PRECIO TOTAL', style: 'tableHeader' }
                ],
                ...ventas.map(sale => [
                  { text: sale.numerofactura, style: 'textos' },
                  { text: formatearFecha(sale.fecha), style: 'textos' },
                  { text: (sale.canastas_llenas.reduce((acc, val) => acc + val, 0) - sale.canastas_vacias.reduce((acc, val) => acc + val, 0)).toFixed(1) + ' kg', style: 'textos' },
                  { text: formatearPrecio(sale.preciokilo), style: 'textos' },
                  { text: formatearPrecio(((sale.canastas_llenas.reduce((acc, val) => acc + val, 0) - sale.canastas_vacias.reduce((acc, val) => acc + val, 0)) * sale.preciokilo).toFixed(0)), style: 'textos' }
                ])
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
              { text: 'Total General: ', bold: true },
              formatearPrecio((precioTotal).toFixed(0))
            ],
            style: 'total'
          },
          {
            canvas: [
              { type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, color: '#ff9900' }
            ],
            margin: [0, 0, 0, 10]
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
      res.setHeader('Content-Disposition', `attachment; filename=factura_${clienteId}.pdf`);
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
