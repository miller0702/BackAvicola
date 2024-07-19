const Sale = require("../models/sale");
const PdfPrinter = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../config/configPg');

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

      const printer = new PdfPrinter({
        Roboto: {
          normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
          bold: path.join(__dirname, '../fonts/Roboto-Medium.ttf'),
          italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
          bolditalics: path.join(__dirname, '../fonts/Roboto-MediumItalic.ttf')
        }
      });

      const docDefinition = {
        content: [
          { text: 'Factura', style: 'header' },
          `Fecha: ${sale.fecha}`,
          `Cliente: ${cliente ? cliente.nombre : 'Desconocido'}`,
          `Teléfono: ${cliente ? cliente.telefono : 'Desconocido'}`,
          `Cantidad de Aves: ${sale.cantidadaves}`,
          `Cantidad de Kilos: ${sale.canastas_llenas - sale.canastas_vacias}`,
          `Precio por Kilo: ${sale.preciokilo}`,
          `Total: ${(sale.canastas_llenas - sale.canastas_vacias) * sale.preciokilo}`
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          }
        }
      };

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura_${saleId}.pdf`);

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al generar la factura",
        error: error,
      });
    }
  }

};
