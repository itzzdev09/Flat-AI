import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import User from './UserModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const USER_STORE_PATH = path.join(DATA_DIR, 'users.json');

const isMongoReady = () => mongoose.connection.readyState === 1;

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readLocalUsers = async () => {
  try {
    const raw = await fs.readFile(USER_STORE_PATH, 'utf8');
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeLocalUsers = async (users) => {
  await ensureDataDir();
  await fs.writeFile(USER_STORE_PATH, JSON.stringify(users, null, 2), 'utf8');
};

const toLocalUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role || 'user',
});

const sanitizeUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role || 'user',
});

export const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isMongoReady()) {
    return User.findOne({ email: normalizedEmail }).lean();
  }

  const users = await readLocalUsers();
  return users.find((user) => user.email === normalizedEmail) || null;
};

export const findUserById = async (id) => {
  if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
    return User.findById(id).lean();
  }

  const users = await readLocalUsers();
  return users.find((user) => String(user._id) === String(id)) || null;
};

export const createUser = async ({ name, email, passwordHash, role = 'user' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isMongoReady()) {
    const user = await User.create({ name, email: normalizedEmail, passwordHash, role });
    return user.toObject();
  }

  const users = await readLocalUsers();
  const user = {
    _id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash,
    role,
  };
  users.push(user);
  await writeLocalUsers(users);
  return toLocalUser(user);
};

export const updateUserProfile = async (id, updates) => {
  if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
  }

  const users = await readLocalUsers();
  const index = users.findIndex((user) => String(user._id) === String(id));
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await writeLocalUsers(users);
  return users[index];
};

export const updateUserPassword = async (id, passwordHash) => {
  if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
    return User.findByIdAndUpdate(id, { passwordHash }, {
      new: true,
      runValidators: true,
    }).lean();
  }

  const users = await readLocalUsers();
  const index = users.findIndex((user) => String(user._id) === String(id));
  if (index === -1) return null;
  users[index] = { ...users[index], passwordHash };
  await writeLocalUsers(users);
  return users[index];
};

export const listUsers = async () => {
  if (isMongoReady()) {
    return User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  }

  const users = await readLocalUsers();
  return users.map(({ passwordHash, ...user }) => user);
};

export const setUserRole = async (id, role) => {
  if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
    return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).lean();
  }

  const users = await readLocalUsers();
  const index = users.findIndex((user) => String(user._id) === String(id));
  if (index === -1) return null;
  users[index] = { ...users[index], role };
  await writeLocalUsers(users);
  return users[index];
};

export { sanitizeUser };
