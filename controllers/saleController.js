const Sale = require("../models/sale");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Sale.getAll();
      console.log(`Facturas: ${data}`);
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
      console.log(`Totales`,totales);
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

      const doc = new PDFDocument();
      const filePath = path.join(__dirname, `../invoices/invoice_${saleId}.pdf`);
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(25).text(`Factura #${saleId}`, {
        align: 'center'
      });

      doc.fontSize(16).text(`Cliente ID: ${sale.cliente_id}`);
      doc.text(`Lote ID: ${sale.lote_id}`);
      doc.text(`Usuario ID: ${sale.user_id}`);
      doc.text(`Cantidad de Aves: ${sale.cantidadaves}`);
      doc.text(`Canastas Vacías: ${sale.canastas_vacias}`);
      doc.text(`Canastas Llenas: ${sale.canastas_llenas}`);
      doc.text(`Precio por Kilo: ${sale.preciokilo}`);
      doc.text(`Fecha: ${sale.fecha}`);
      doc.text(`Número de Factura: ${sale.numerofactura}`);

      doc.end();

      doc.on('finish', () => {
        return res.status(200).json({
          success: true,
          message: "Factura generada con éxito",
          filePath: filePath
        });
      });

    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al generar la factura",
        error: error,
      });
    }
  },
};
