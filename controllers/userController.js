const User = require("../models/user");
const jwt = require("jsonwebtoken");
const key = require("../config/key");

module.exports = {
  async getAll(req, res, next) {
    try {
      const users = await User.getAll();
      console.log(`Usuarios: ${users}`);
      return res.status(201).json(users);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los usuarios",
      });
    }
  },

  async registerUser(req, res, next) {
    try {
      const user = req.body;
      const newUser = await User.create(user);

      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con exito",
        data: newUser.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al Registrar el usuario",
        error: error,
      });
    }
  },

  async login(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "El usuario no fue encontrado",
        });
      }

      if (User.isPasswordMatched(password, user.password)) {
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          key.secretOrKey,
          {
            // expiresIn(60*60*24)
          }
        );

        const data = {
          id: user.id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          rol:user.rol,
          image: user.image,
          session_token: `JWT ${token}`,
        };

        return res.status(201).json({
          success: true,
          data: data,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "La Contraseña es Incorrecta",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de logeo",
        error: error,
      });
    }
  },

  async updateEmail(req, res, next) {
    try {
      const email = req.body.email;

      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.body.id) {
        return res.status(401).json({
          success: false,
          message: "El correo ya existe",
        });
      }

      await User.updateEmail(req.body);

      const data = {
        id: req.body.id,
        email: email,
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

  async updateName(req, res, next) {
    try {
      await User.updateName(req.body);

      const data = {
        id: req.body.id,
        name: req.body.name
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

  async updateLastName(req, res, next) {
    try {
      await User.updateLastName(req.body);

      const data = {
        id: req.body.id,
        lastname: req.body.lastname,
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

  async updatePhone(req, res, next) {
    try {
      const phone = req.body.phone;

      const existingUser = await User.findByPhone(phone);
      if (existingUser && existingUser.id !== req.body.id) {
        return res.status(401).json({
          success: false,
          message: "El telefono ya existe",
        });
      }

      await User.updatePhone(req.body);

      const data = {
        id: req.body.id,
        phone: phone,
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

  async updateImage(req, res, next) {
    const firebaseConfig = {
      apiKey: "AIzaSyDnAZDOqCTozQab2Oa4jVrlCcZXEoNL5jk",
      authDomain: "app-avicola.firebaseapp.com",
      projectId: "app-avicola",
      storageBucket: "app-avicola.appspot.com",
      messagingSenderId: "1071513662784",
      appId: "1:1071513662784:web:8859a4742db86949c9f6a5",
      measurementId: "G-GCX28ZJ54K"
    };

    const app = initializeApp(firebaseConfig);

    const storage = getStorage(app);

    getDownloadURL(ref(storage, req.body.image)).then(async (url) => {
      console.log(url);

      const user = req.body.id;

      await User.updateImage(user, url);

      const data = {
        id: req.body.id,
        image: url,
      };

      return res.status(201).json({
        success: true,
        message: "La actualizacion se ha realizado con exito",
        data: data,
      });
    });
  },
};
