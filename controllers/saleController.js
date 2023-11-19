const Sale = require("../models/sale");

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Sale.getAll();
      console.log(`Venta: ${data}`);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el venta",
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
        message: "Error al Registrar la Venta",
        error: error,
      });
    }
  },

  async updateIdClien(req, res, next) {
    try {
      const sale = req.body;

      await Sale.updateIdClient(sale);

      const data = {
        id: req.body.id,
        id_client: req.body.id_client,
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
      const sale = req.body;

      await Sale.updateCantidadPollo(sale);

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
      const sale = req.body;

      await Sale.updateCantidadKilos(sale);

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
      const sale = req.body;

      await Sale.updatePrecioKilo(sale);

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
