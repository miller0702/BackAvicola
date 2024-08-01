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
const headerHorizontalImagePath = path.join(__dirname, '../public/images/header_h.png');
const footerHorizontalImagePath = path.join(__dirname, '../public/images/footer_h.png');

const headerImageBase64 = `data:image/png;base64,${fs.readFileSync(headerImagePath).toString('base64')}`;
const footerImageBase64 = `data:image/png;base64,${fs.readFileSync(footerImagePath).toString('base64')}`;
const headerHorizontalImageBase64 = `data:image/png;base64,${fs.readFileSync(headerHorizontalImagePath).toString('base64')}`;
const footerHorizontalImageBase64 = `data:image/png;base64,${fs.readFileSync(footerHorizontalImagePath).toString('base64')}`;


function formatearPrecio(precio) {
  const numeroPrecio = Number(precio);

  if (!isNaN(numeroPrecio) && isFinite(numeroPrecio)) {
    const precioRedondeado = numeroPrecio.toFixed(0);
    return Number(precioRedondeado).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
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
      const lotes = await Lote.getAll();
      return res.status(200).json(lotes);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los lotes de aves",
        error: error.message,
      });
    }
  },

  async getAllActive(req, res, next) {
    try {
      const lotes = await Lote.getAllActive();
      return res.status(200).json(lotes);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los lotes de aves activos",
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

  async updateEstado(req, res, next) {
    try {
      const { id, estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: "Estado inválido. Debe ser 'activo' o 'inactivo'.",
        });
      }

      await Lote.updateEstado(id, estado);

      return res.status(200).json({
        success: true,
        message: "Estado del lote de aves actualizado exitosamente",
        data: { id, estado },
      });
    } catch (error) {
      console.error(`Error al actualizar el estado del lote de aves: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el estado del lote de aves",
        error: error.message,
      });
    }
  },

  async reporteLote(req, res, next) {
    try {
      const lotId = req.params.id;
      const tipoReporte = req.query.tipo;

      const loteData = await Lote.getReporteLote(lotId);

      const { descripcion } = loteData;

      let docDefinition;
      
      let totalVentas;

      switch (tipoReporte) {

        case '1':
          try {
            const comprasData = await Lote.getReporteLoteBuys(lotId);

            const precioTotal = comprasData.reduce((acc, compra) => {
              return acc + parseFloat(compra.valor_con_flete);
            }, 0);

            const totalBultos = comprasData.reduce((acc, compra) => {
              return acc + parseFloat(compra.cantidad_bultos);
            }, 0);

            if (!comprasData) {
              return res.status(404).json({
                success: false,
                message: "No se encontraron datos de compras para el lote",
              });
            }

            docDefinition = {
              pageMargins: [20, 60, 30, 60],
              pageOrientation: 'landscape',
              header: {
                image: headerHorizontalImageBase64,
                width: 842,
                height: 50,
                alignment: 'center',
                margin: [0, 0, 0, 0]
              },
              footer: function (currentPage, pageCount) {
                return {
                  image: footerHorizontalImageBase64,
                  width: 842,
                  height: 50,
                  alignment: 'center',
                  margin: [0, 15, 0, 0],
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
                          style: 'descripcionText'
                        },
                      ]
                    },
                    {
                      image: `data:image/png;base64,${logoBase64}`,
                      width: 100,
                      alignment: 'right',
                      margin: [0, 0, 0, 0]
                    }
                  ]
                },
                {
                  text: 'Reporte de Compras de Alimento',
                  style: 'header'
                },
                {
                  columns: [
                    {
                      stack: [
                        { text: `${descripcion}`, style: 'subheader' },
                        {
                          text: `Fecha: ${formatearFecha(new Date())}`,
                          style: 'fechaExpedicion',
                        }
                      ]
                    },
                    {
                      stack: [
                        {
                          text: `VALOR TOTAL: ${formatearPrecio(precioTotal)}`, style: 'subheader'
                        },
                        {
                          text: `TOTAL BULTOS: ${totalBultos}`, style: 'subheader'
                        }
                      ]
                    }
                  ]
                },
                {
                  table: {
                    widths: [65, 120, '*', 60, '*', '*', '*', '*'],
                    body: [
                      [
                        { text: 'Fecha', style: 'tableHeader' },
                        { text: 'Tipo', style: 'tableHeader' },
                        { text: 'Procedencia', style: 'tableHeader' },
                        { text: 'Cantidad', style: 'tableHeader' },
                        { text: 'Valor Unidad', style: 'tableHeader' },
                        { text: 'Valor Bultos', style: 'tableHeader' },
                        { text: 'Valor Flete', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' }
                      ],
                      ...comprasData.map(compra => [
                        formatearFecha(new Date(compra.fecha)),
                        compra.tipo_purina || 'N/A',
                        compra.procedencia || 'N/A',
                        compra.cantidad_bultos ? compra.cantidad_bultos.toString() : 'N/A',
                        formatearPrecio(Number(compra.valor_unitario).toFixed(0) || 0),
                        formatearPrecio(Number(compra.valor_bultos).toFixed(0) || 0),
                        formatearPrecio(Number(compra.valor_flete).toFixed(0) || 0),
                        formatearPrecio(Number(compra.valor_con_flete).toFixed(0) || 0)
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
                  },
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
                fechaExpedicion: {
                  fontSize: 12,
                  color: "#666",
                  italics: true,
                  margin: [0, 0, 0, 15]
                },
                tableHeader: {
                  bold: true,
                  fontSize: 12,
                  color: 'black'
                },
              }
            };
          } catch (error) {
            console.error("Error al generar el reporte:", error);
            return res.status(500).json({
              success: false,
              message: "Error al obtener el reporte",
              error: error.message || error
            });
          }
          break;

        case '2':
          const alimentoData = await Lote.getReporteLoteFood(lotId);

          const totalConsumidoHembra = alimentoData.reduce((acc, alimento) => {
            return acc + parseFloat(alimento.cantidadhembra);
          }, 0);

          const totalConsumidoMacho = alimentoData.reduce((acc, alimento) => {
            return acc + parseFloat(alimento.cantidadmacho);
          }, 0);

          const totalConsumido = totalConsumidoHembra + totalConsumidoMacho || 0;

          if (!alimentoData) {
            return res.status(404).json({
              success: false,
              message: "No se encontraron datos de alimento para el lote",
            });
          }

          docDefinition = {
            pageMargins: [30, 80, 30, 100],
            header: function (currentPage, pageCount, pageSize) {
              return {
                image: headerImageBase64,
                width: 595,
                height: 80,
                alignment: 'center',
                margin: [0, 0, 0, 0]
              };
            },
            footer: function (currentPage, pageCount, pageSize) {
              return {
                image: footerImageBase64,
                width: 595,
                height: 80,
                alignment: 'center',
                margin: [0, 20, 0, 0]
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
                        style: 'descripcionText'
                      },
                    ]
                  },
                  {
                    image: `data:image/png;base64,${logoBase64}`,
                    width: 100,
                    alignment: 'right',
                    margin: [0, 0, 0, 0]
                  }
                ]
              },
              {
                text: 'Reporte de Alimento Consumido por las Aves',
                style: 'header'
              },
              {
                columns: [
                  {
                    stack: [
                      { text: `${descripcion}`, style: 'subheader' },
                      {
                        text: `Fecha: ${formatearFecha(new Date())}`,
                        style: 'fechaExpedicion',
                      }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: `TOTAL BULTOS CONSUMIDOS: ${totalConsumido}`, style: 'subheader'
                      },
                    ]
                  }
                ]
              },
              {
                table: {
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: 'Fecha', style: 'tableHeader' },
                      { text: 'Cantidad Hembras', style: 'tableHeader' },
                      { text: 'Cantidad Machos', style: 'tableHeader' },
                    ],
                    ...alimentoData.map(alimento => [
                      formatearFecha(new Date(alimento.fecha)),
                      alimento.cantidadhembra ? `${alimento.cantidadhembra.toString()} bultos` : '0 Bultos',
                      alimento.cantidadmacho ? `${alimento.cantidadmacho.toString()} bultos` : '0 Bultos',
                    ]),
                    [
                      { text: 'Totales', style: 'tableHeader', bold: true },
                      { text: `${totalConsumidoHembra} bultos`, style: 'tableHeader' },
                      { text: `${totalConsumidoMacho} bultos`, style: 'tableHeader' },
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
                },
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
              fechaExpedicion: {
                fontSize: 12,
                color: "#666",
                italics: true,
                margin: [0, 0, 0, 15]
              },
              tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black'
              }
            }
          };

          break;

        case '3':
          const mortalidadData = await Lote.getReporteLoteMortality(lotId);

          const totalMortalidadHembra = mortalidadData.reduce((acc, mortalidad) => {
            return acc + parseFloat(mortalidad.cantidadhembra);
          }, 0);

          const totalMortalidadMacho = mortalidadData.reduce((acc, mortalidad) => {
            return acc + parseFloat(mortalidad.cantidadmacho);
          }, 0);

          const totalMortalidad = totalMortalidadHembra + totalMortalidadMacho || 0;

          if (!mortalidadData) {
            return res.status(404).json({
              success: false,
              message: "No se encontraron datos de mortalidad para el lote",
            });
          }
          docDefinition = {
            pageMargins: [30, 80, 30, 100],
            header: function (currentPage, pageCount, pageSize) {
              return {
                image: headerImageBase64,
                width: 595,
                height: 80,
                alignment: 'center',
                margin: [0, 0, 0, 0]
              };
            },
            footer: function (currentPage, pageCount, pageSize) {
              return {
                image: footerImageBase64,
                width: 595,
                height: 80,
                alignment: 'center',
                margin: [0, 20, 0, 0]
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
                        style: 'descripcionText'
                      },
                    ]
                  },
                  {
                    image: `data:image/png;base64,${logoBase64}`,
                    width: 100,
                    alignment: 'right',
                    margin: [0, 0, 0, 0]
                  }
                ]
              },
              {
                text: 'Reporte de Mortalidad de las Aves',
                style: 'header'
              },
              {
                columns: [
                  {
                    stack: [
                      { text: `${descripcion}`, style: 'subheader' },
                      {
                        text: `Fecha: ${formatearFecha(new Date())}`,
                        style: 'fechaExpedicion',
                      }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: `TOTAL AVES MUERTAS: ${totalMortalidad}`, style: 'subheader'
                      },
                    ]
                  }
                ]
              },
              {
                table: {
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: 'Fecha', style: 'tableHeader' },
                      { text: 'Cantidad Hembras', style: 'tableHeader' },
                      { text: 'Cantidad Machos', style: 'tableHeader' },
                    ],
                    ...mortalidadData.map(mortalidad => [
                      formatearFecha(new Date(mortalidad.fecha)),
                      mortalidad.cantidadhembra ? `${mortalidad.cantidadhembra.toString()} aves` : '0 Aves',
                      mortalidad.cantidadmacho ? `${mortalidad.cantidadmacho.toString()} aves` : '0 Aves',
                    ]),
                    [
                      { text: 'Totales', style: 'tableHeader', bold: true },
                      { text: `${totalMortalidadHembra} aves`, style: 'tableHeader' },
                      { text: `${totalMortalidadMacho} aves`, style: 'tableHeader' },
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
                },
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
              fechaExpedicion: {
                fontSize: 12,
                color: "#666",
                italics: true,
                margin: [0, 0, 0, 15]
              },
              tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black'
              }
            }
          };


          break;

        case '4':

          const insumoData = await Lote.getReporteLoteSupplies(lotId);

          const precioTotal = insumoData.reduce((acc, insumo) => {
            return acc + parseFloat(insumo.valor);
          }, 0);

          if (!insumoData) {
            return res.status(404).json({
              success: false,
              message: "No se encontraron datos de insumos para el lote",
            });
          }
          docDefinition = {
            pageMargins: [30, 80, 30, 100],
            header: function (currentPage, pageCount, pageSize) {
              return {
                image: headerImageBase64,
                width: 595,
                height: 80,
                alignment: 'center',
                margin: [0, 0, 0, 0]
              };
            },
            footer: function (currentPage, pageCount, pageSize) {
              return {
                image: footerImageBase64,
                width: 595,
                height: 80,
                alignment: 'center',
                margin: [0, 20, 0, 0]
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
                        style: 'descripcionText'
                      },
                    ]
                  },
                  {
                    image: `data:image/png;base64,${logoBase64}`,
                    width: 100,
                    alignment: 'right',
                    margin: [0, 0, 0, 0]
                  }
                ]
              },
              {
                text: 'Reporte de Insumos y Gastos de las Aves',
                style: 'header'
              },
              {
                columns: [
                  {
                    stack: [
                      { text: `${descripcion}`, style: 'subheader' },
                      {
                        text: `Fecha: ${formatearFecha(new Date())}`,
                        style: 'fechaExpedicion',
                      }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: `VALOR TOTAL: ${formatearPrecio(precioTotal)}`, style: 'subheader'
                      },
                    ]
                  }
                ]
              },
              {
                table: {
                  widths: [70, 150, '*', '*'],
                  body: [
                    [
                      { text: 'Fecha', style: 'tableHeader' },
                      { text: 'Proveedor', style: 'tableHeader' },
                      { text: 'Descripción', style: 'tableHeader' },
                      { text: 'Valor', style: 'tableHeader' },
                    ],
                    ...insumoData.map(insumo => [
                      formatearFecha(new Date(insumo.fecha)),
                      insumo.proveedor ? `${insumo.proveedor.toString()}` : 'Desconocido',
                      insumo.descripcion ? `${insumo.descripcion.toString()}` : 'Desconocido',
                      formatearPrecio(Number(insumo.valor).toFixed(0) || 0),
                    ]),
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
                },
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
              fechaExpedicion: {
                fontSize: 12,
                color: "#666",
                italics: true,
                margin: [0, 0, 0, 15]
              },
              tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black'
              }
            }
          };


          break;
      
        case '5':

        const ventaData = await Lote.getReporteLoteSales(lotId);

        totalVentas = ventaData.reduce((acc, venta) => {
          return acc + parseFloat(venta.total);
        }, 0);

        if (!ventaData) {
          return res.status(404).json({
            success: false,
            message: "No se encontraron datos de ventas para el lote",
          });
        }
        docDefinition = {
          pageMargins: [30, 80, 30, 100],
          header: function (currentPage, pageCount, pageSize) {
            return {
              image: headerImageBase64,
              width: 595,
              height: 80,
              alignment: 'center',
              margin: [0, 0, 0, 0]
            };
          },
          footer: function (currentPage, pageCount, pageSize) {
            return {
              image: footerImageBase64,
              width: 595,
              height: 80,
              alignment: 'center',
              margin: [0, 20, 0, 0]
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
                      style: 'descripcionText'
                    },
                  ]
                },
                {
                  image: `data:image/png;base64,${logoBase64}`,
                  width: 100,
                  alignment: 'right',
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            {
              text: 'Reporte de Ventas',
              style: 'header'
            },
            {
              columns: [
                {
                  stack: [
                    { text: `${descripcion}`, style: 'subheader' },
                    {
                      text: `Fecha: ${formatearFecha(new Date())}`,
                      style: 'fechaExpedicion',
                    }
                  ]
                },
                {
                  stack: [
                    {
                      text: `VALOR TOTAL: ${formatearPrecio(totalVentas)}`, style: 'subheader'
                    },
                  ]
                }
              ]
            },
            {
              table: {
                body: [
                  [
                    { text: 'Fecha', style: 'tableHeader' },
                    { text: 'Cliente', style: 'tableHeader' },
                    { text: 'Aves', style: 'tableHeader' },
                    { text: 'Kilos', style: 'tableHeader' },
                    { text: 'Precio Kilo', style: 'tableHeader' },
                    { text: 'Total', style: 'tableHeader' },
                  ],
                  ...ventaData.map(venta => [
                    formatearFecha(new Date(venta.fecha)),
                    venta.cliente ? `${venta.cliente.toString()}` : 'Desconocido',
                    venta.aves ? `${venta.aves.toString()}` : 'Desconocido',
                    venta.kilos ? `${venta.kilos.toString()}` : 'Desconocido',
                    formatearPrecio(Number(venta.precio).toFixed(0) || 0),
                    formatearPrecio(Number(venta.total).toFixed(0) || 0),
                  ]),
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
              },
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
            fechaExpedicion: {
              fontSize: 12,
              color: "#666",
              italics: true,
              margin: [0, 0, 0, 15]
            },
            tableHeader: {
              bold: true,
              fontSize: 12,
              color: 'black'
            }
          }
        };


        break;

        case '6':

        const abonoData = await Lote.getReporteLotePayments(lotId);
        const vData = await Lote.getReporteLoteSales(lotId);

        const totalAbono = abonoData.reduce((acc, abono) => {
          return acc + parseFloat(abono.valor);
        }, 0);

        const totalV = vData.reduce((acc, venta) => {
          return acc + parseFloat(venta.total);
        }, 0);

        const deudaTotal = totalV - totalAbono

        if (!abonoData) {
          return res.status(404).json({
            success: false,
            message: "No se encontraron datos de ventas para el lote",
          });
        }
        docDefinition = {
          pageMargins: [30, 80, 30, 100],
          header: function (currentPage, pageCount, pageSize) {
            return {
              image: headerImageBase64,
              width: 595,
              height: 80,
              alignment: 'center',
              margin: [0, 0, 0, 0]
            };
          },
          footer: function (currentPage, pageCount, pageSize) {
            return {
              image: footerImageBase64,
              width: 595,
              height: 80,
              alignment: 'center',
              margin: [0, 20, 0, 0]
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
                      style: 'descripcionText'
                    },
                  ]
                },
                {
                  image: `data:image/png;base64,${logoBase64}`,
                  width: 100,
                  alignment: 'right',
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            {
              text: 'Reporte de Ventas',
              style: 'header'
            },
            {
              columns: [
                {
                  stack: [
                    { text: `${descripcion}`, style: 'subheader' },
                    {
                      text: `Fecha: ${formatearFecha(new Date())}`,
                      style: 'fechaExpedicion',
                    }
                  ]
                },
                {
                  stack: [
                    {
                      text: `VALOR TOTAL ABONADO: ${formatearPrecio(totalAbono)}`, style: 'subheader'
                    },
                    {
                      text: `VALOR TOTAL EN DEUDA: ${formatearPrecio(deudaTotal)}`, style: 'subheader'
                    },
                  ]
                }
              ]
            },
            {
              table: {
                body: [
                  [
                    { text: 'Fecha', style: 'tableHeader' },
                    { text: 'Cliente', style: 'tableHeader' },
                    { text: 'Teléfono', style: 'tableHeader' },
                    { text: 'Método Pago', style: 'tableHeader' },
                    { text: 'Valor Abonado', style: 'tableHeader' },
                  ],
                  ...abonoData.map(abono => [
                    formatearFecha(new Date(abono.fecha)),
                    abono.cliente ? `${abono.cliente.toString()}` : 'Desconocido',
                    abono.telefono ? `${abono.telefono.toString()}` : 'Desconocido',
                    abono.metodo_pago ? `${abono.metodo_pago.toString()}` : 'Desconocido',
                    formatearPrecio(Number(abono.valor).toFixed(0) || 0),
                  ]),
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
              },
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
            fechaExpedicion: {
              fontSize: 12,
              color: "#666",
              italics: true,
              margin: [0, 0, 0, 15]
            },
            tableHeader: {
              bold: true,
              fontSize: 12,
              color: 'black'
            }
          }
        };


        break;

        default:
          return res.status(400).json({
            success: false,
            message: "Tipo de reporte no válido",
          });
      }

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura_${lotId}.pdf`);
      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      return res.status(500).json({
        success: false,
        message: "Error al generar el reporte PDF",
        error: error.message || error
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

      const totalBultosTraidosResult = await db.one("SELECT SUM(cantidad_bultos) as cantidad_bultos FROM buys WHERE lote_id = $1", [lotId]);
      const totalBultosTraidos = parseFloat(totalBultosTraidosResult.cantidad_bultos) || 0;

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

      const avesFinales = avesNum - totalVendidas - totalMortalidadNum;
      const promedioKg = totalVendidas !== 0 ? (totalKilosNum / totalVendidas) : 0;
      const avesReal = totalMortalidadNum + totalVendidas;
      const porcentajeMor = avesNum !== 0 ? (totalMortalidadNum / avesNum) : 0;
      const precioAve = totalVendidas !== 0 ? (totalVentasNum / totalVendidas) : 0;
      const consumoAve = avesNum !== 0 ? ((totalComprasAlimentoNum * valorBulto) / avesNum) : 0;
      const valorUnaAve = totalComprasNum !== 0 ? (((totalBultos / totalComprasNum) / valorBulto) * consumoAve) : 0;
      const arrendamiento = gananciasNum * 0.08;
      const administracion = 4970000;
      const gananciasRep = gananciasNum - arrendamiento - administracion;
      const gananciasMiller = gananciasRep * 0.75;
      const gananciasLeo = gananciasRep * 0.25;

      const docDefinition = {
        pageMargins: [30, 80, 30, 80],
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
                    style: 'descripcionText'
                  },
                ]
              },
              {
                image: `data:image/png;base64,${logoBase64}`,
                width: 100,
                alignment: 'right',
                margin: [0, 0, 0, 10]
              }
            ]
          },
          {
            text: 'Reporte General del Lote',
            style: 'header'
          },
          {
            text: `${descripcion}`,
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
                  { text: `Precio por Ave: ${formatearPrecio(precioAve)}`, style: 'tableHeader' },
                ],
                [
                  { text: `Alimento Traido: ${totalBultosTraidos}`, style: 'tableHeader' },
                  { text: `Total Kilos Vendidos: ${totalKilosNum.toFixed(1)} kg`, style: 'tableHeader' },
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
                // [
                //   { text: 'Total Kilos', style: 'tableHeader' },
                //   totalKilosNum
                // ],
                [
                  { text: 'Total Compras de Insumos', style: 'tableHeader' },
                  formatearPrecio(totalComprasInsumosNum)
                ],
                [
                  { text: 'Total Compras de Alimento', style: 'tableHeader' },
                  formatearPrecio(totalComprasAlimentoNum)
                ],
                [
                  { text: 'Costo Total del Lote', style: 'tableHeader' },
                  formatearPrecio(costoTotalLoteNum)
                ],
                [
                  { text: 'Gastos Totales del Lote', style: 'tableHeader' },
                  formatearPrecio(gastosNum)
                ],
                [
                  { text: 'Ganancia Bruta del Lote', style: 'tableHeader' },
                  formatearPrecio(gananciasNum)
                ],
                [
                  { text: 'Pago Arrendamiento', style: 'tableHeader' },
                  formatearPrecio(arrendamiento)
                ],
                [
                  { text: 'Pago Administración', style: 'tableHeader' },
                  formatearPrecio(administracion)
                ],
                [
                  { text: 'Ganancias Miller 75%', style: 'tableHeader' },
                  formatearPrecio(gananciasMiller)
                ],
                [
                  { text: 'Ganancias Leonardo 25%', style: 'tableHeader' },
                  formatearPrecio(gananciasLeo)
                ],
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
      return res.status(200).json({ totalLote: totalLote });
    } catch (error) {
      return res.status(501).json({
        success: false,
        message: "Error al obtener el total de alimento",
        error: error,
      });
    }
  },

};
