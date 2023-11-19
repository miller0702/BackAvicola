const Mortality = require("../models/mortality");

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Mortality.getAll();
      console.log(`Mortalidad: ${data}`);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el alimento",
      });
    }
  },

  async register(req, res, next) {
    try {
      const mortality = req.body;
      const data = await Mortality.create(mortality);

      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con exito",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al Registrar el alimento",
        error: error,
      });
    }
  },


   
  async updateCantidadHembra(req, res, next) {
    try {
      const mortality = req.body;

      await Mortality.updateCantidadHembra(mortality);

      const data = {
        id: req.body.id,
        cantidadhembra: req.body.cantidadhembra,
      };

      return res.status(201).json({
        success: true,
        message: "La actualizacion se ha realizado con exito",
        data: data,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de actualizar",
        error: error,
      });
    }
  },

  async updateCantidadMacho(req, res, next) {
    try {
      const mortality = req.body;

      await Mortality.updateCantidadMacho(mortality);

      const data = {
        id: req.body.id,
        cantidadmacho: req.body.cantidadmacho,
      };

      return res.status(201).json({
        success: true,
        message: "La actualizacion se ha realizado con exito",
        data: data,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de actualizar",
        error: error,
      });
    }
  },
};
