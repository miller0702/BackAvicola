const User = require("../models/user");
const jwt = require("jsonwebtoken");
const key = require("../config/key");
const { admin, bucket } = require("../config/configFirebase");
const { default: mongoose } = require("mongoose");

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
      const { name, lastname, phone, email, password, rol } = req.body;

      if (![1, 2, 3].includes(rol)) {
        return res.status(400).json({
          success: false,
          message: "Rol inválido",
        });
      }

      const newUser = await User.create({ name, lastname, phone, email, password, rol });

      return res.status(201).json({
        success: true,
        message: "El registro se ha realizado con éxito",
        data: newUser.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al registrar el usuario",
        error: error,
      });
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      console.log(`Intentando iniciar sesión con email: ${email}`);

      const user = await User.findByEmail(email);
      if (!user) {
        console.log(`Usuario no encontrado: ${email}`);
        return res.status(401).json({
          success: false,
          message: "El usuario no fue encontrado",
        });
      }

      if (!user.isActive) {
        console.log(`Usuario inactivo: ${email}`);
        return res.status(403).json({
          success: false,
          message: "El usuario está inactivo",
        });
      }

      if (User.isPasswordMatched(password, user.password)) {
        const token = jwt.sign(
          { id: user.id, email: user.email },
          key.secretOrKey,
          { expiresIn: '24h' }
        );

        const data = {
          id: user.id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          rol: user.rol,
          image: user.image,
          session_token: `JWT ${token}`,
        };

        console.log(`Inicio de sesión exitoso para: ${email}`);
        return res.status(200).json({
          success: true,
          data: data,
        });
      } else {
        console.log(`Contraseña incorrecta para: ${email}`);
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

  updateImage: async (req, res, next) => {
    try {
      const userId = req.body.id;
      const image = req.file;

      if (!image) {
        return res.status(400).json({
          success: false,
          message: "No se ha proporcionado una imagen",
        });
      }

      const fileName = `${Date.now()}_${image.originalname}`;
      const file = bucket.file(`images/${fileName}`);
      const stream = file.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
      });

      stream.on('error', (error) => {
        console.error('Error al subir la imagen a Firebase Storage:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al subir la imagen',
        });
      });

      stream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/images/${fileName}`;
        await User.updateImage(userId, publicUrl);

        return res.status(201).json({
          success: true,
          message: "La imagen se ha actualizado con exito",
          data: { imageUrl: publicUrl },
        });
      });

      stream.end(image.buffer);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de actualizar la imagen",
        error: error,
      });
    }
  },

  updateAllExceptSensitive: async (req, res, next) => {
    try {
      const userId = req.body.id;
      const updateData = req.body;

      const updatedUser = await User.updateAllExceptSensitive(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(201).json({
        success: true,
        message: "Los datos se han actualizado con éxito",
        data: updatedUser,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de actualizar los datos",
        error: error,
      });
    }
  },

  async getUserById(req, res, next) {
    const verify = await obtenerDatos(req.headers.authorization);
  
    if (!verify.success) {
      return res.status(401).json(verify);
    }
  
    const email = verify.data.email;
  
    try {
      const user = await User.getByEmail(email);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }
  
      console.log(`Usuario encontrado: ${user}`);
      return res.status(200).json(user);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el usuario',
      });
    }
  },  

  async updateUser(req, res, next) {
    try {
      const userEmail = req.body.email;

      const existingUser = await User.getByEmail(userEmail);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const updatedUser = await User.updateAllExceptSensitive(existingUser[0]._id, req.body);

      return res.status(201).json({
        success: true,
        message: "La actualización se ha realizado con éxito",
        data: updatedUser,
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

  async updateUserStatus(req, res, next) {
    try {
      console.log(`Parametros de la solicitud: ${JSON.stringify(req.params)}`);
      console.log(`Cuerpo de la solicitud: ${JSON.stringify(req.body)}`);

      const userId = req.params.id;
      const { isActive } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido",
        });
      }

      const updatedUser = await User.updateStatus(userId, isActive);

      return res.status(200).json({
        success: true,
        message: `El estado del usuario se ha ${isActive ? 'activado' : 'desactivado'} con éxito`,
        data: updatedUser,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al actualizar el estado del usuario",
        error: error,
      });
    }
  },

  async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      if (!user.isActive) {
        await User.deleteById(userId);
        return res.status(200).json({
          success: true,
          message: "Usuario eliminado con éxito",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "El usuario debe estar inactivo para ser eliminado",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al eliminar el usuario",
        error: error,
      });
    }
  }

};
async function obtenerDatos(tokenRecibido) {
  if (!tokenRecibido || !tokenRecibido.startsWith("JWT ")) {
    return {
      success: false,
      message: 'Token no proporcionado o formato incorrecto'
    };
  }

  const token = tokenRecibido.substring(4); 

  try {
    const decoded = jwt.verify(token, key.secretOrKey);

    return {
      success: true,
      message: 'Token validado con éxito',
      data: decoded
    };
  } catch (error) {
    console.error('Error al validar el token:', error);

    let errorMessage = 'Error al validar el token';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token JWT malformado';
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token no activo aún';
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message
    };
  }
}
