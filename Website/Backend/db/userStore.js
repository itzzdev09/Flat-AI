import mongoose from 'mongoose';
import User from './UserModel.js';

const isMongoReady = () => mongoose.connection.readyState === 1;

const sanitizeUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role || 'user',
});

const requireMongoReady = () => {
  if (!isMongoReady()) {
    throw new Error('MongoDB is required for authentication and user management.');
  }
};

export const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  requireMongoReady();
  return User.findOne({ email: normalizedEmail }).lean();
};

export const findUserById = async (id) => {
  requireMongoReady();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findById(id).lean();
};

export const createUser = async ({ name, email, passwordHash, role = 'user' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  requireMongoReady();
  const user = await User.create({ name, email: normalizedEmail, passwordHash, role });
  return user.toObject();
};

export const updateUserProfile = async (id, updates) => {
  requireMongoReady();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();
};

export const updateUserPassword = async (id, passwordHash) => {
  requireMongoReady();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findByIdAndUpdate(id, { passwordHash }, {
    new: true,
    runValidators: true,
  }).lean();
};

export const listUsers = async () => {
  requireMongoReady();
  return User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
};

export const setUserRole = async (id, role) => {
  requireMongoReady();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).lean();
};

export { sanitizeUser };
