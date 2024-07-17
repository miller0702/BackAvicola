const Sale = require("../models/saleMg");

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Sale.getAll();
      console.log(`Factura: ${data}`);
      return res.status(200).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las facturas",
        error: error,
      });
    }
  },

  async register(req, res, next) {
    try {
      const sale = req.body;
      const data = await Sale.createSale(sale);

      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con éxito",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al registrar la factura",
        error: error,
      });
    }
  },

  async update(req, res, next) {
    try {
      const saleId = req.params.id;
      const updatedData = req.body;
      const data = await Sale.updateSale(saleId, updatedData);

      return res.status(200).json({
        success: true,
        message: "La factura se ha actualizado con éxito",
        data: data,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al actualizar la factura",
        error: error,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const saleId = req.params.id;
      await Sale.deleteSale(saleId);

      return res.status(200).json({
        success: true,
        message: "La factura se ha eliminado con éxito",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al eliminar la factura",
        error: error,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const saleId = req.params.id;
      const sale = await Sale.getById(saleId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la factura",
        });
      }

      return res.status(200).json(sale);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la factura por ID",
        error: error,
      });
    }
  },

  async findByNumeroFactura(req, res, next) {
    try {
      const numeroFactura = req.params.numerofactura;
      const sale = await Sale.findByNumeroFactura(numeroFactura);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la factura con ese número",
        });
      }

      return res.status(200).json(sale);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la factura por número",
        error: error,
      });
    }
  },
};
