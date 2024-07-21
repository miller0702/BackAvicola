const User = require("../models/user");
const jwt = require("jsonwebtoken");
const key = require("../config/key");
const { admin, bucket } = require("../config/configFirebase");

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

    const verify = await obtenerDatos(req.headers.authorization)

    const email = verify.data.email

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
  }
};

async function obtenerDatos(tokenRecibido) {

  const token = tokenRecibido.split(" ")[1]


  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, key.secretOrKey);
  
    // Ahora, 'decoded' contiene la información decodificada del token
    // console.log('Token decodificado:', decoded);
  
    // Puedes retornar los datos en formato JSON
    const responseJson = {
      success: true,
      message: 'Token validado con éxito',
      data: decoded
    };
  
    // console.log('Respuesta JSON:', responseJson);
    return responseJson
  } catch (error) {
    // Si hay un error al validar el token
    console.error('Error al validar el token:', error);
  
    // Puedes retornar un mensaje de error en formato JSON
    const errorJson = {
      success: false,
      message: 'Error al validar el token',
      error: error.message
    };
  
    // console.log('Respuesta de error JSON:', errorJson);
    return errorJson
  }
}