const userController = require("../controllers/userController");
const UserController = require("../controllers/userController");
const FoodController = require("../controllers/foodController");
const MortalityController = require("../controllers/mortalityController");
const pagosController = require("../controllers/pagosController");
const SuppliesController = require("../controllers/suppliesController");
const BuysController = require("../controllers/buyController");
const SaleController = require("../controllers/saleController");
const SaleMgController = require("../controllers/saleMgController");
const CustomersController = require("../controllers/customerController");
const SuppliersController = require("../controllers/supplierController");
const LoteController = require("../controllers/loteController");
const PaymentController = require("../controllers/paymentController");
const EventController = require('../controllers/eventController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

module.exports = (app) => {

  // Obtener todos los eventos
  app.get('/api/events/getAll', EventController.getAll);
  app.get('/api/events/getById/:id', EventController.getById);
  app.post('/api/events/create', EventController.create);
  app.put('/api/events/update/:id', EventController.update);
  app.delete('/api/events/delete/:id', EventController.delete);

  // Pagos
  app.post("/api/pagos/obtenerFirma", pagosController.obtenerFirma);
  app.post("/api/pagos/confirmacion", pagosController.confirmacion);
  app.post("/api/pagos/factura", pagosController.getFactura);

  // Usuarios
  app.get("/api/users/getUserById", userController.getUserById);
  app.get("/api/users/getAll", UserController.getAll);
  app.put("/api/users/updateUser", UserController.updateUser);
  app.post("/api/users/updateEmail", UserController.updateEmail);
  app.post("/api/users/updateName", UserController.updateName);
  app.post("/api/users/updateLastName", UserController.updateLastName);
  app.post("/api/users/updatePhone", UserController.updatePhone);
  app.post("/api/users/updateImage", upload.single('file'), UserController.updateImage);
  app.post("/api/users/create", userController.registerUser);
  app.post("/api/users/login", userController.login);

  // Comida
  app.get("/api/food/getAll", FoodController.getAll);
  app.post("/api/food/register", FoodController.register);
  app.post("/api/food/getById", FoodController.getById);
  app.delete("/api/food/delete/:id", FoodController.delete);
  app.put("/api/food/update/:id", FoodController.update);
  app.post("/api/food/updateCantidadHembra", FoodController.updateCantidadHembra);
  app.post("/api/food/updateCantidadMacho", FoodController.updateCantidadMacho);
  app.get('/api/food/getTotalFood', FoodController.getTotalFood);
  app.get('/api/food/getFoodByDay', FoodController.getFoodByDay);

  // Mortalidad
  app.get("/api/mortality/getAll", MortalityController.getAll);
  app.post("/api/mortality/register", MortalityController.register);
  app.post("/api/mortality/getById", MortalityController.getById);
  app.delete("/api/mortality/delete/:id", MortalityController.delete);
  app.put("/api/mortality/update/:id", MortalityController.update);
  app.post("/api/mortality/updateCantidadHembra", MortalityController.updateCantidadHembra);
  app.post("/api/mortality/updateCantidadMacho", MortalityController.updateCantidadMacho);
  app.get('/api/mortality/getTotalMortality', MortalityController.getTotalMortality);
  app.get('/api/mortality/getMortalityByDay', MortalityController.getMortalitiesByDay);

  // Clientes
  app.get('/api/customers/getAll', CustomersController.getAll);
  app.post("/api/customers/register", CustomersController.register);
  app.post("/api/customers/getById", CustomersController.getById);
  app.delete("/api/customers/delete/:id", CustomersController.delete);
  app.put("/api/customers/update", CustomersController.update);
  app.get('/api/customers/getTotalCustomers', CustomersController.getTotalCustomers);
  app.get('/api/customers/getCustomers', CustomersController.getCustomers);
  app.get('/api/customers/:id/invoice', CustomersController.generateInvoice);

  // Proveedores
  app.get('/api/suppliers/getAll', SuppliersController.getAll);
  app.post("/api/suppliers/register", SuppliersController.register);
  app.post("/api/suppliers/getById", SuppliersController.getById);
  app.delete("/api/suppliers/delete/:id", SuppliersController.delete);
  app.put("/api/suppliers/update/:id", SuppliersController.update);
  app.get('/api/suppliers/getTotalSuppliers', SuppliersController.getTotalsuppliers);

  // Lote
  app.get('/api/lote/getAll', LoteController.getAll);
  app.post("/api/lote/register", LoteController.register);
  app.post("/api/lote/getById", LoteController.getById);
  app.delete("/api/lote/delete/:id", LoteController.delete);
  app.put("/api/lote/update/:id", LoteController.update);
  app.get('/api/lote/:id/invoice', LoteController.reporteGeneralLote);
  app.get('/api/lote/getTotalLote', LoteController.getTotalLote);

  // Suministros
  app.get("/api/supplies/getAll", SuppliesController.getAll);
  app.post("/api/supplies/register", SuppliesController.register);
  app.post("/api/supplies/getById", SuppliesController.getById);
  app.delete("/api/supplies/delete/:id", SuppliesController.delete);
  app.put("/api/supplies/update/:id", SuppliesController.update);
  app.get('/api/supplies/getTotalSupplies', SuppliesController.getTotalSupplies);

  // Compras
  app.get("/api/buys/getAll", BuysController.getAll);
  app.post("/api/buys/register", BuysController.register);
  app.post("/api/buys/getById", BuysController.getById);
  app.delete("/api/buys/delete/:id", BuysController.delete);
  app.put("/api/buys/update/:id", BuysController.update);
  app.get('/api/buys/getTotalBuys', BuysController.getTotalBuys);

  // Pagos
  app.get("/api/payment/getAll", PaymentController.getAll);
  app.post("/api/payment/register", PaymentController.register);
  app.post("/api/payment/getById", PaymentController.getById);
  app.delete("/api/payment/delete/:id", PaymentController.delete);
  app.put("/api/payment/update/:id", PaymentController.update);
  app.get('/api/payment/getTotalSale', PaymentController.getTotalPayment);
  app.get('/api/payment/:id/invoice', PaymentController.generateInvoice);

  // Ventas Postgres
  app.get("/api/sale/getAll", SaleController.getAll);
  app.post("/api/sale/register", SaleController.register);
  app.post("/api/sale/getById", SaleController.getById);
  app.delete("/api/sale/delete/:id", SaleController.delete);
  app.put("/api/sale/update/:id", SaleController.update);
  app.get('/api/sale/getTotalSale', SaleController.getTotalSale);
  app.get('/api/sale/:id/invoice', SaleController.generateInvoice);

  // Ventas Mongo
  app.get("/api/saleMg/getAll", SaleMgController.getAll);
  app.post("/api/saleMg/register", SaleMgController.register);
  app.post("/api/saleMg/getById", SaleMgController.getById);
  app.delete("/api/saleMg/delete/:id", SaleMgController.delete);
  app.put("/api/saleMg/update/:id", SaleMgController.update);

  // Multi
  app.get('/api/sale/getTotales', SaleController.getTotales);
};
