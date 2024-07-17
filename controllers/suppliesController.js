const Supplies = require("../models/supplies");

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Supplies.getAll();
      return res.status(200).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los insumos",
        error: error,
      });
    }
  },

  async register(req, res, next) {
    try {
      const supplies = req.body;
      const data = await Supplies.create(supplies);
      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con éxito",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al registrar el insumo",
        error: error,
      });
    }
  },

  async update(req, res, next) {
    try {
      const supplies = req.body;
      await Supplies.update(supplies);

      const updatedSupplies = {
        id: supplies.id,
        proveedor_id: supplies.proveedor_id,
        descripcioncompra: supplies.descripcioncompra,
        preciocompra: supplies.preciocompra,
        fecha: supplies.fecha,
      };

      return res.status(200).json({
        success: true,
        message: "El insumo se ha actualizado con éxito",
        data: updatedSupplies,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el insumo",
        error: error,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const suppliesId = req.params.id;
      await Supplies.delete(suppliesId);

      return res.status(200).json({
        success: true,
        message: "El insumo se ha eliminado con éxito",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el insumo",
        error: error,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const suppliesId = req.params.id;
      const supplies = await Supplies.getById(suppliesId);

      if (!supplies) {
        return res.status(404).json({
          success: false,
          message: "No se encontró el insumo",
        });
      }

      return res.status(200).json(supplies);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el insumo por ID",
        error: error,
      });
    }
  },

  async getTotalSupplies(req, res, next) {
    try {
      const totalSupplies = await Supplies.getTotalSupplies();
      return res.status(200).json(totalSupplies);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el total de insumos",
        error: error,
      });
    }
  },
};
