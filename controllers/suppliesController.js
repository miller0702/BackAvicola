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

  async updateIdClient(req, res, next) {
    try {
      const supplies = req.body;

      await Supplies.updateIdClient(supplies);

      const data = {
        id: req.body.id,
        proveedor: req.body.proveedor,
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
   
  async updateCantidadPollo(req, res, next) {
    try {
      const supplies = req.body;

      await Supplies.updateCantidadPollo(supplies);

      const data = {
        id: req.body.id,
        cantidadpollo: req.body.cantidadpollo,
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

  async updateCantidadKilos(req, res, next) {
    try {
      const supplies = req.body;

      await Supplies.updateCantidadKilos(supplies);

      const data = {
        id: req.body.id,
        cantidadkilos: req.body.cantidadkilos,
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

  async updatePrecioKilo(req, res, next) {
    try {
      const supplies = req.body;

      await Supplies.updatePrecioKilo(supplies);

      const data = {
        id: req.body.id,
        preciokilo: req.body.preciokilo,
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
