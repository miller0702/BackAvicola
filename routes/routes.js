const userController = require("../controllers/userController");
const UserController = require("../controllers/userController");
const FoodController = require("../controllers/foodController");
const MortalityController = require("../controllers/mortalityController");
const pagosController = require("../controllers/pagosController");
const SuppliesController = require("../controllers/suppliesController");
const SaleController = require("../controllers/saleController");
const SaleMgController = require ("../controllers/saleMgController")

module.exports = (app) => {
  // Pagos
  app.post("/api/pagos/obtenerFirma", pagosController.obtenerFirma);
  app.post("/api/pagos/confirmacion", pagosController.confirmacion);
  app.post("/api/pagos/factura", pagosController.getFactura);

  //Users
  app.get("/api/users/getUserById", UserController.getUserById);
  app.get("/api/users/getAll", UserController.getAll);
  app.put("/api/users/updateUser", UserController.updateUser);
  app.post("/api/users/updateEmail", UserController.updateEmail);
  app.post("/api/users/updateName", UserController.updateName);
  app.post("/api/users/updateLastName", UserController.updateLastName);
  app.post("/api/users/updatePhone", UserController.updatePhone);
  app.post("/api/users/updateImage", UserController.updateImage);
  app.post("/api/users/create", userController.registerUser);
  app.post("/api/users/login", userController.login);

  //Food
  app.get("/api/food/getAll", FoodController.getAll);
  app.post("/api/food/register", FoodController.register);
  app.post("/api/food/getById", FoodController.getById);
  app.delete("/api/food/delete", FoodController.delete);
  app.put("/api/food/update", FoodController.update);
  app.post("/api/food/updateCantidadHembra", FoodController.updateCantidadHembra);
  app.post("/api/food/updateCantidadMacho", FoodController.updateCantidadMacho);
  app.get('/api/food/getTotalFood', FoodController.getTotalFood);
  app.get('/api/Food/getFoodByDay', FoodController.getFoodByDay);

  //Mortality
  app.get("/api/mortality/getAll", MortalityController.getAll);
  app.post("/api/mortality/register", MortalityController.register);
  app.post("/api/mortality/getById", MortalityController.getById);
  app.delete("/api/mortality/delete", MortalityController.delete);
  app.put("/api/mortality/update", MortalityController.update);
  app.post("/api/mortality/updateCantidadHembra", MortalityController.updateCantidadHembra);
  app.post("/api/mortality/updateCantidadMacho", MortalityController.updateCantidadMacho);
  app.get('/api/mortality/getTotalMortality', MortalityController.getTotalMortality);
  app.get('/api/mortality/getMortalityByDay', MortalityController.getMortalitiesByDay);

  //Supplies
  app.get("/api/supplies/getAll", SuppliesController.getAll);
  app.post("/api/supplies/register", SuppliesController.register);
  app.post("/api/supplies/getById", SuppliesController.getById);
  app.delete("/api/supplies/delete", SuppliesController.delete);
  app.put("/api/supplies/update", SuppliesController.update);
  app.get('/api/supplies/getTotalSupplies', SuppliesController.getTotalSupplies);

  //Sales Postgres
  app.get("/api/sale/getAll", SaleController.getAll);
  app.post("/api/sale/register", SaleController.register);
  app.post("/api/sale/getById", SaleController.getById);
  app.delete("/api/sale/delete", SaleController.delete);
  app.put("/api/sale/update", SaleController.update);
  app.get('/api/sale/getTotalSale', SaleController.getTotalSale);
  
  //Sales Mongo
  app.get("/api/saleMg/getAll", SaleMgController.getAll);
  app.post("/api/saleMg/register", SaleMgController.register);
  app.post("/api/saleMg/getById", SaleMgController.getById);
  app.delete("/api/saleMg/delete", SaleMgController.delete);
  app.put("/api/saleMg/update", SaleMgController.update);

  // Multi
  app.get('/api/sale/getTotales', SaleController.getTotales);
};
