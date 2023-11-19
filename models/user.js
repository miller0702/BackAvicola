const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    image: { type: String },
    rol: { type: String },
    phone: { type: String, required: true },
    sessionToken: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const User = mongoose.model('User', UserSchema);

User.getAll = async () => {
    const users = await User.find();

    return users;
};

User.findById = async (id) => {
    const user = await User.findById(id);

    return user;
};

User.findByEmail = async (email) => {
    const user = await User.findOne({ email });

    return user;
};

User.updateImage = async (user, url) => {
    const myPassHashed = crypto.createHash('md5').update(user.password).digest('hex');
    user.password = myPassHashed;

    await User.updateOne({ id: user.id }, { image: url });

    return user;
};

User.create = async (user) => {
    const myPassHashed = crypto.createHash('md5').update(user.password).digest('hex');
    user.password = myPassHashed;
  
    const newUser = new User(user);
    await newUser.save();
  
    return newUser;
  };
  

User.updateEmail = async (user) => {
    await User.updateOne({ id: user.id }, { email: user.email });

    return user;
};

User.updateName = async (user) => {
    await User.updateOne({ id: user.id }, { name: user.name });

    return user;
};

User.updateLastName = async (user) => {
    await User.updateOne({ id: user.id }, { lastname: user.lastname });

    return user;
};

User.updatePhone = async (user) => {
    await User.updateOne({ id: user.id }, { phone: user.phone });

    return user;
};

User.isPasswordMatched = (candidatePassword, hash) => {
    const myPasswordHashed = crypto.createHash('md5').update(candidatePassword).digest('hex');
    if (myPasswordHashed === hash) {
        return true;
    }
    return false;
};

module.exports = User;
