const userController = require('../controllers/userController');
const UserController = require('../controllers/userController');
const foodController = require('../controllers/foodController');
const FoodController = require('../controllers/foodController');
const mortalityController = require('../controllers/foodController');
const MortalityController = require('../controllers/foodController');


module.exports=(app)=>{
    //Peticiones de consulta
    //Users
    app.get('/api/users/getAll',UserController.getAll);
    //Food
    app.get('/api/food/getAll',FoodController.getAll);
    //Mortality
    app.get('/api/mortality/getAll',MortalityController.getAll);

    //Peticiones de insercion
    app.post('/api/users/create',userController.registerUser);
    app.post('/api/users/login',userController.login);
    //Food
    app.post('/api/food/create',foodController.register);
    //Mortality
    app.post('/api/mortality/create',mortalityController.register);

    //Actualizar campos
    //User
    app.post('/api/users/updateEmail',UserController.updateEmail);
    app.post('/api/users/updateName',UserController.updateName);
    app.post('/api/users/updateLastName',UserController.updateLastName);
    app.post('/api/users/updatePhone',UserController.updatePhone);
    app.post('/api/users/updateImage',UserController.updateImage);
    //Food
    app.post('/api/food/updateCantidadHembra',FoodController.updateCantidadHembra);
    app.post('/api/food/updateCantidadMacho',FoodController.updateCantidadMacho);
    //Mortality
    app.post('/api/mortality/updateCantidadHembra',MortalityController.updateCantidadHembra);
    app.post('/api/mortality/updateCantidadMacho',MortalityController.updateCantidadMacho);
    
}