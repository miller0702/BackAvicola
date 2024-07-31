const Event = require('../models/event');

module.exports = {
  
  async getAll(req, res, next) {
    try {
      const events = await Event.getAll();
      return res.status(200).json(events);
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({ success: false, message: "Error al obtener eventos" });
    }
  },

  async getById(req, res, next) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Evento no encontrado" });
      }
      return res.status(200).json(event);
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({ success: false, message: "Error al obtener el evento por ID" });
    }
  },

  async create(req, res, next) {
    try {
      const event = req.body;
      const data = await Event.create(event);
      return res.status(201).json({ success: true, message: "Evento creado con éxito", data: data.id });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({ success: false, message: "Error al crear el evento" });
    }
  },

  async update(req, res, next) {
    try {
      const event = req.body;
      await Event.update(event);
      return res.status(200).json({ success: true, message: "Evento actualizado con éxito" });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({ success: false, message: "Error al actualizar el evento" });
    }
  },

  async delete(req, res, next) {
    try {
      await Event.delete(req.params.id);
      return res.status(200).json({ success: true, message: "Evento eliminado con éxito" });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({ success: false, message: "Error al eliminar el evento" });
    }
  },
};
