const Buys = require("../models/buy");

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Buys.getAll();
      return res.status(200).json(data);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener las compras",
        error: error.message,
      });
    }
  },

  async register(req, res, next) {
    try {
      const buys = req.body;
      const data = await Buys.create(buys);
      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con éxito",
        data: data.id,
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al registrar la compra",
        error: error.message,
      });
    }
  },

  async update(req, res, next) {
    try {
      const buys = req.body;
      await Buys.update(buys);

      const updatedBuys = {
        id: buys.id,
        proveedor_id: buys.proveedor_id,
        lote_id: buys.lote_id,
        procedencia: buys.procedencia,
        tipo_purina: buys.tipo_purina,
        cantidad_bultos: buys.cantidad_bultos,
        valor_unitario: buys.valor_unitario,
        valor_flete: buys.valor_flete,
        valor_bultos: buys.valor_bultos,
        valor_con_flete: buys.valor_con_flete,
        fecha: buys.fecha,
      };

      return res.status(200).json({
        success: true,
        message: "La compra se ha actualizado con éxito",
        data: updatedBuys,
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la compra",
        error: error.message,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const buysId = req.params.id;
      await Buys.deleteById(buysId);

      return res.status(200).json({
        success: true,
        message: "La compra se ha eliminado con éxito",
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la compra",
        error: error.message,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const buysId = req.params.id;
      const buys = await Buys.findById(buysId);

      if (!buys) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la compra",
        });
      }

      return res.status(200).json(buys);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener la compra por ID",
        error: error.message,
      });
    }
  },

  async getTotalBuys(req, res, next) {
    try {
      const totalBuys = await Buys.getTotalBuys();
      return res.status(200).json(totalBuys);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el total de compras",
        error: error.message,
      });
    }
  },
};
