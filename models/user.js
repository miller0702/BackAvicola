const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  image: { type: String },
  rol: { type: Number, enum: [1, 2, 3], required: true }, // 1=admin, 2=galponero, 3=cliente
  phone: { type: String, required: true },
  sessionToken: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

User.getAll = async () => {
  return await User.find();
};

User.findById = async (id) => {
  return await User.findById(id).exec();
};

User.findByEmail = async (email) => {
  return await User.findOne({ email });
};

User.updateImage = async (userId, url) => {
  return await User.findByIdAndUpdate(userId, { image: url, updatedAt: Date.now() }, { new: true });
};

User.create = async (user) => {
  const myPassHashed = crypto.createHash('md5').update(user.password).digest('hex');
  user.password = myPassHashed;
  const newUser = new User(user);
  await newUser.save();
  return newUser;
};

User.updateEmail = async (user) => {
  await User.updateOne({ _id: user.id }, { email: user.email });
  return user;
};

User.updateName = async (user) => {
  await User.updateOne({ _id: user.id }, { name: user.name });
  return user;
};

User.updateLastName = async (user) => {
  await User.updateOne({ _id: user.id }, { lastname: user.lastname });
  return user;
};

User.updatePhone = async (user) => {
  await User.updateOne({ _id: user.id }, { phone: user.phone });
  return user;
};

User.isPasswordMatched = (candidatePassword, hash) => {
  const myPasswordHashed = crypto.createHash('md5').update(candidatePassword).digest('hex');
  return myPasswordHashed === hash;
};

User.getByEmail = async (email) => {
  return await User.findOne({ email });
};

User.updateAllExceptSensitive = async (userId, userData) => {
  const sensitiveFields = ['password', 'image', 'sessionToken', 'rol', 'createdAt', 'updatedAt'];
  const updateData = Object.keys(userData)
    .filter(key => !sensitiveFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = userData[key];
      return obj;
    }, {});

  updateData.updatedAt = Date.now();
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

User.updateStatus = async (userId, isActive) => {
  return await User.findByIdAndUpdate(userId, { isActive, updatedAt: Date.now() }, { new: true });
};

User.deleteById = async (userId) => {
  const user = await User.findById(userId);
  if (user && !user.isActive) {
    return await User.findByIdAndDelete(userId);
  } else {
    throw new Error('El usuario debe estar inactivo para ser eliminado.');
  }
};

module.exports = User;
