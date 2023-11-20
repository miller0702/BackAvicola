const Supplies = require("../models/supplies");

module.exports = {
  
  async getAll(req, res, next) {
    try {
      const data = await Supplies.getAll();
      console.log(`Insumo: ${data}`);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el insumo",
      });
    }
  },

  async register(req, res, next) {
    try {
      const supplies = req.body;
      const data = await Supplies.create(supplies);

      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con exito",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al Registrar la Insumo",
        error: error,
      });
    }
  },

  async update(req, res, next) {
    try {
      const supplies = req.body;
      await Supplies.update(supplies);

      const data = {
        id: req.body.id,
        proveedor: req.body.proveedor,
        descripcioncompra: req.body.descripcioncompra,
        preciocompra: req.body.preciocompra,
        fecha: req.body.fecha
      };

      return res.status(201).json({
        success: true,
        message: "La insumo se ha actualizado con éxito",
        data: data,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al actualizar la insumo",
        error: error,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const suppliesId = req.params.id;
      await Supplies.delete(suppliesId);

      return res.status(201).json({
        success: true,
        message: "La insumo se ha eliminado con éxito",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al eliminar la insumo",
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
          message: "No se encontró la insumo",
        });
      }

      return res.status(200).json(supplies);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la insumo por ID",
        error: error,
      });
    }
  },
  async getTotalSupplies(req, res, next) {
    try {
      const totalSupplies = await Supplies.getTotalSupplies();
      console.log(`Total de Insumos: ${totalSupplies}`);
      return res.status(200).json(totalSupplies);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el total de Insumos",
        error: error,
      });
    }
  },
};