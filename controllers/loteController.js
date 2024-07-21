const Lote = require("../models/lote");
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
      const lotes = await Lote.getAll();
      console.log(`Lotes:`, lotes);
      return res.status(200).json(lotes);
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los lotes de aves",
        error: error.message,
      });
    }
  },

  async register(req, res, next) {
    try {
      const loteData = req.body;
      const newLote = await Lote.create(loteData);

      return res.status(201).json({
        success: true,
        message: "Lote de aves registrado exitosamente",
        data: newLote.id,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al registrar el lote de aves",
        error: error.message,
      });
    }
  },

  async updateDescripcion(req, res, next) {
    try {
      const { id, descripcion } = req.body;
      await Lote.updateDescripcion(id, descripcion);

      return res.status(200).json({
        success: true,
        message: "Descripción del lote de aves actualizada exitosamente",
        data: { id, descripcion },
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la descripción del lote de aves",
        error: error.message,
      });
    }
  },

  async updateCantidadAves(req, res, next) {
    try {
      const { id, cantidad_aves } = req.body;
      await Lote.updateCantidadAves(id, cantidad_aves);

      return res.status(200).json({
        success: true,
        message: "Cantidad de aves del lote actualizada exitosamente",
        data: { id, cantidad_aves },
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la cantidad de aves del lote",
        error: error.message,
      });
    }
  },

  async update(req, res, next) {
    try {
      const loteData = req.body;
      await Lote.update(loteData);

      return res.status(200).json({
        success: true,
        message: "Datos del lote de aves actualizados exitosamente",
        data: loteData,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar los datos del lote de aves",
        error: error.message,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const loteId = req.params.id;
      await Lote.deleteById(loteId);

      return res.status(200).json({
        success: true,
        message: "Lote de aves eliminado exitosamente",
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el lote de aves",
        error: error.message,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const loteId = req.params.id;
      const lote = await Lote.findById(loteId);

      if (!lote) {
        return res.status(404).json({
          success: false,
          message: "Lote de aves no encontrado",
        });
      }

      return res.status(200).json(lote);
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el lote de aves por ID",
        error: error.message,
      });
    }
  },

  async reporteGeneralLote(req, res, next) {
    try {
      const lotId = req.params.id;

      const loteData = await Lote.getReporteLote(lotId);

      if (!loteData) {
        return res.status(404).json({
          success: false,
          message: "No se encontró el lote",
        });
      }

      const totalVendidasResult = await db.one("SELECT SUM(cantidadaves) as total_vendidas FROM sales WHERE lote_id = $1", [lotId]);
      const totalVendidas = parseFloat(totalVendidasResult.total_vendidas) || 0;

      const totalBultosResult = await db.one("SELECT SUM(valor_unitario) as valor_bultos FROM buys WHERE lote_id = $1", [lotId]);
      const totalBultos = parseFloat(totalBultosResult.valor_bultos) || 0;

      const {
        descripcion,
        aves,
        total_compras,
        total_ventas,
        total_kilos,
        total_mortalidad,
        total_compras_insumos,
        total_compras_alimento,
        total_consumo_alimento,
        costo_total_lote,
        ganancias,
        gastos
      } = loteData;

      // Convierte los valores a números
      const avesNum = parseFloat(aves) || 0;
      const totalComprasNum = parseFloat(total_compras) || 0;
      const totalVentasNum = parseFloat(total_ventas) || 0;
      const totalKilosNum = parseFloat(total_kilos) || 0;
      const totalMortalidadNum = parseFloat(total_mortalidad) || 0;
      const totalComprasInsumosNum = parseFloat(total_compras_insumos) || 0;
      const totalComprasAlimentoNum = parseFloat(total_compras_alimento) || 0;
      const totalConsumoAlimentoNum = parseFloat(total_consumo_alimento) || 0;
      const costoTotalLoteNum = parseFloat(costo_total_lote) || 0;
      const gananciasNum = parseFloat(ganancias) || 0;
      const gastosNum = parseFloat(gastos) || 0;

      valorBulto = 40;
      // Asegúrate de que los valores sean correctos
      const avesFinales = avesNum - totalVendidas - totalMortalidadNum;
      const promedioKg = totalVendidas !== 0 ? (totalKilosNum / totalVendidas) : 0;
      const avesReal = totalMortalidadNum + totalVendidas;
      const porcentajeMor = avesNum !== 0 ? (totalMortalidadNum / avesNum) : 0;
      const precioAve = totalVendidas !== 0 ? (totalVentasNum / totalVendidas) : 0;
      const consumoAve = avesNum !== 0 ? ((totalComprasAlimentoNum * valorBulto) / avesNum) : 0;
      const valorUnaAve = totalComprasNum !== 0 ? (((totalBultos / totalComprasNum) / valorBulto) * consumoAve) : 0;

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
            margin: [0, -30, 0, 0],
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
                    style: 'descripcionText'
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
            text: 'Reporte General del Lote',
            style: 'header'
          },
          {
            text: `Lote: ${descripcion}`,
            style: 'subheader'
          },
          {
            text: `Fecha: ${formatearFecha(new Date())}`,
            style: 'fechaExpedicion'
          },
          {
            text: 'BALANCE AVES',
            style: 'sectionHeader'
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: `Total Aves Iniciales: ${avesNum}`, style: 'tableHeader' },
                  { text: `Total Aves Vendidas: ${totalVendidas}`, style: 'tableHeader' },
                ],
                [
                  { text: `Total Mortalidad: ${totalMortalidadNum}`, style: 'tableHeader' },
                  { text: `Total Aves en Galpón: ${avesFinales}`, style: 'tableHeader' },
                ],
                [
                  { text: `Promedio Kilaje de las Aves: ${promedioKg.toFixed(2)} kg`, style: 'tableHeader' },
                  { text: `Porcentaje Mortalidad: ${(porcentajeMor * 100).toFixed(2)}%`, style: 'tableHeader' },
                ],
                [
                  { text: `Total Alimento Consumido: ${totalConsumoAlimentoNum}`, style: 'tableHeader' },
                  { text: `Precio por Ave: ${precioAve.toFixed(2)}`, style: 'tableHeader' },
                ],
                [
                  { text: `Alimento Consumido por Ave: ${consumoAve.toFixed(2)}`, style: 'tableHeader' },
                  { text: `Valor de un Ave: ${valorUnaAve.toFixed(2)}`, style: 'tableHeader' },
                ]
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
            text: 'BALANCE GENERAL',
            style: 'sectionHeader'
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'DESCRIPCIÓN', style: 'tableHeader2' },
                  { text: 'VALOR', style: 'tableHeader2' }
                ],
                [
                  { text: 'Total Ventas', style: 'tableHeader' },
                  formatearPrecio(totalVentasNum)
                ],
                [
                  { text: 'Total Kilos', style: 'tableHeader' },
                  formatearPrecio(totalKilosNum)
                ],
                [
                  { text: 'Total Compras de Insumos', style: 'tableHeader' },
                  formatearPrecio(totalComprasInsumosNum)
                ],
                [
                  { text: 'Total Compras de Alimento', style: 'tableHeader' },
                  formatearPrecio(totalComprasAlimentoNum)
                ],
                [
                  { text: 'Total Consumo de Alimento', style: 'tableHeader' },
                  formatearPrecio(totalConsumoAlimentoNum)
                ],
                [
                  { text: 'Costo Total del Lote', style: 'tableHeader' },
                  formatearPrecio(costoTotalLoteNum)
                ],
                [
                  { text: 'Ganancia del Lote', style: 'tableHeader' },
                  formatearPrecio(gananciasNum)
                ],
                [
                  { text: 'Gastos del Lote', style: 'tableHeader' },
                  formatearPrecio(gastosNum)
                ]
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
          }
        ],
        styles: {
          header: {
            fontSize: 22,
            color: "#ff9900",
            bold: true,
            alignment: 'left',
            margin: [0, 10, 0, 10]
          },
          descripcionText: {
            fontSize: 12,
            alignment: 'left',
            margin: [0, 5, 0, 5]
          },
          subheader: {
            fontSize: 16,
            color: "#333",
            bold: true,
            margin: [0, 10, 0, 5]
          },
          fechaExpedicion: {
            fontSize: 12,
            color: "#666",
            italics: true,
            margin: [0, 0, 0, 15]
          },
          sectionHeader: {
            fontSize: 14,
            color: "#000",
            bold: true,
            margin: [0, 20, 0, 10]
          },
          tableHeader2: {
            bold: true,
            fontSize: 14,
            color: '#333'
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black'
          }
        }
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura_${lotId}.pdf`);
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

  async getTotalLote(req, res, next) {
    try {
      const totalLoteResult = await Lote.getTotalLote();
      const totalLote = totalLoteResult.totallote ? parseInt(totalLoteResult.totallote, 10) : 0;
      console.log(`Total de Lotes: ${totalLote}`);
      return res.status(200).json({ totalLote: totalLote });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el total de alimento",
        error: error,
      });
    }
  },

};
