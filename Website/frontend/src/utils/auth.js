import axios from 'axios';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';
const AUTH_SESSION_KEY = 'authSession';
export const AUTH_CHANGE_EVENT = 'auth-change';

const safeJsonParse = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof window === 'undefined') return null;

  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};

const getSessionFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return null;
  }

  const issuedAt = payload.iat || Math.floor(Date.now() / 1000);
  return {
    expiresInSeconds: Math.max(0, payload.exp - issuedAt),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
};

const isSessionExpired = (session) => {
  if (!session?.expiresAt) {
    return false;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
};

const dispatchAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};

export const clearStoredAuth = (notify = true) => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);

  if (notify) {
    dispatchAuthChange();
  }
};

export const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null, session: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const user = safeJsonParse(window.localStorage.getItem(AUTH_USER_KEY));
  const storedSession = safeJsonParse(window.localStorage.getItem(AUTH_SESSION_KEY));
  const session = storedSession?.expiresAt ? storedSession : getSessionFromToken(token);

  if (!token || !user) {
    if (token || user || storedSession) {
      clearStoredAuth(false);
    }
    return { token: null, user: null, session: null };
  }

  if (isSessionExpired(session)) {
    clearStoredAuth(false);
    return { token: null, user: null, session: null };
  }

  if (session && !storedSession) {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  return { token, user, session };
};

export const storeAuthSession = ({ token, user, session }) => {
  if (typeof window === 'undefined') return null;

  if (!token || !user) {
    clearStoredAuth();
    return null;
  }

  const resolvedSession = session?.expiresAt ? session : getSessionFromToken(token);

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  if (resolvedSession) {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(resolvedSession));
  } else {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }

  dispatchAuthChange();
  return resolvedSession;
};

export const getAuthHeaders = () => {
  const { token } = getStoredAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const refreshStoredAuth = async () => {
  const { token } = getStoredAuth();
  if (!token) {
    return null;
  }

  const response = await axios.get(`${process.env.REACT_APP_NODE_API_URL}auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (typeof window !== 'undefined') {
    const { user, session } = response.data || {};

    if (user) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    if (session?.expiresAt) {
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
    }

    dispatchAuthChange();
  }

  return {
    token,
    user: response.data?.user || null,
    session: response.data?.session || null,
  };
};

export const formatSessionDuration = (expiresInSeconds) => {
  if (!expiresInSeconds || expiresInSeconds <= 0) {
    return 'expired';
  }

  const days = Math.floor(expiresInSeconds / 86400);
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(expiresInSeconds / 3600);
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const minutes = Math.max(1, Math.floor(expiresInSeconds / 60));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
};

export const formatSessionExpiry = (expiresAt) => {
  if (!expiresAt) {
    return 'Unknown';
  }

  return new Date(expiresAt).toLocaleString();
};
