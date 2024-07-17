const Supplier = require("../models/supplier")

module.exports = {
    
  async getAll(req, res, next) {
    try {
      const suppliers = await Supplier.getAll();
      console.log("Proveedores:", suppliers);
      return res.status(200).json(suppliers);
    } catch (error) {
      console.error(`Error al obtener proveedores: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los proveedores",
        error: error.message,
      });
    }
  },

  async register(req, res, next) {
    try {
      const { id, nombre, telefono, documento } = req.body;
      const newSupplier = { id, nombre, telefono, documento };
      const createdSupplier = await Supplier.create(newSupplier);

      return res.status(201).json({
        success: true,
        message: "Proveedor registrado correctamente",
        data: createdSupplier,
      });
    } catch (error) {
      console.error(`Error al registrar proveedor: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al registrar el proveedor",
        error: error.message,
      });
    }
  },

  async update(req, res, next) {
    try {
      const { id, nombre, telefono, documento } = req.body;
      const updatedSupplier = await Supplier.update({ id, nombre, telefono, documento });

      return res.status(200).json({
        success: true,
        message: "Proveedor actualizado correctamente",
        data: updatedSupplier,
      });
    } catch (error) {
      console.error(`Error al actualizar proveedor: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el proveedor",
        error: error.message,
      });
    }
  },

  async delete(req, res, next) {
    try {
      const supplierId = req.params.id;
      await Supplier.delete(supplierId);

      return res.status(200).json({
        success: true,
        message: "Proveedor eliminado correctamente",
      });
    } catch (error) {
      console.error(`Error al eliminar proveedor: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el proveedor",
        error: error.message,
      });
    }
  },

  async getById(req, res, next) {
    try {
      const supplierId = req.params.id;
      const supplier = await Supplier.getById(supplierId);

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Proveedor no encontrado",
        });
      }

      return res.status(200).json(supplier);
    } catch (error) {
      console.error(`Error al obtener proveedor por ID: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el proveedor por ID",
        error: error.message,
      });
    }
  },
};
