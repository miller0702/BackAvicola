const Customer = require("../models/customer")

module.exports = {
    
  async getAll(req, res, next) {
    try {
      const customers = await Customer.getAll();
      console.log("Clientes:", customers);
      return res.status(200).json(customers);
    } catch (error) {
      console.error(`Error al obtener clientes: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los clientes",
        error: error.message,
      });
    }
  },

  async register(req, res, next) {
    try {
      const { id, nombre, telefono, documento } = req.body;
      const newCustomer = { id, nombre, telefono, documento };
      const createdCustomer = await Customer.create(newCustomer);

      return res.status(201).json({
        success: true,
        message: "Cliente registrado correctamente",
        data: createdCustomer,
      });
    } catch (error) {
      console.error(`Error al registrar cliente: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al registrar el cliente",
        error: error.message,
      });
    }
  },

  async update(req, res, next) {
    try {
      const { id, nombre, telefono, documento } = req.body;
      const updatedCustomer = await Customer.update({ id, nombre, telefono, documento });

      return res.status(200).json({
        success: true,
        message: "Cliente actualizado correctamente",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error(`Error al actualizar cliente: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el cliente",
        error: error.message,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const customerId = req.params.id;
      await Customer.delete(customerId);

      return res.status(200).json({
        success: true,
        message: "Cliente eliminado correctamente",
      });
    } catch (error) {
      console.error(`Error al eliminar cliente: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el cliente",
        error: error.message,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const customerId = req.params.id;
      const customer = await Customer.getById(customerId);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error(`Error al obtener cliente por ID: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el cliente por ID",
        error: error.message,
      });
    }
  },
};
