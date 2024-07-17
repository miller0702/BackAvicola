const Lote = require("../models/lote");

module.exports = {
  async getAll(req, res, next) {
    try {
      const lotes = await Lote.getAll();
      console.log(`Lotes:` ,lotes);
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
};
