import { createUser, findUserByEmail, findUserById, sanitizeUser, updateUserPassword, updateUserProfile } from '../db/userStore.js';
import { createSignedToken, getSessionMetadataFromPayload } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { validateLoginInput, validatePasswordChangeInput, validateProfileInput, validateSignupInput } from '../utils/validation.js';

const sendAuthResponse = (res, user, statusCode = 200) => {
  const safeUser = sanitizeUser(user);
  const { token, session } = createSignedToken({ id: safeUser._id, email: safeUser.email });

  return res.status(statusCode).json({
    token,
    user: safeUser,
    session,
  });
};

export const signup = async (req, res) => {
  try {
    const validation = validateSignupInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const { name, email, password } = validation.payload;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const role = adminEmail && adminEmail === email ? 'admin' : 'user';

    const user = await createUser({
      name: name.trim(),
      email,
      passwordHash: hashPassword(password),
      role,
    });

    return sendAuthResponse(res, user, 201);
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const validation = validateLoginInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const { email, password } = validation.payload;

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const me = async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    user: sanitizeUser(user),
    session: getSessionMetadataFromPayload(req.auth),
  });
};

export const updateProfile = async (req, res) => {
  try {
    const validation = validateProfileInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { name, email } = validation.payload;
    const currentUser = await findUserById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email !== currentUser.email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser && String(existingUser._id) !== String(currentUser._id)) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }
    }

    const updatedUser = await updateUserProfile(req.user._id, { name, email });
    return sendAuthResponse(res, updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const validation = validatePasswordChangeInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { currentPassword, newPassword } = validation.payload;
    const currentUser = await findUserById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!verifyPassword(currentPassword, currentUser.passwordHash)) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const updatedUser = await updateUserPassword(req.user._id, hashPassword(newPassword));
    return sendAuthResponse(res, updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Password update failed', error: error.message });
  }
};
