const AUTH_KEY = 'online-test-portal:admin-session';

export const adminCredentials = {
  username: 'AkshayJangid01',
  password: 'Akshay@2004',
};

export function loginAdmin(username, password) {
  if (username === adminCredentials.username && password === adminCredentials.password) {
    const session = { username, loggedInAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  return { ok: false, message: 'Invalid username or password' };
}

export function logoutAdmin() {
  localStorage.removeItem(AUTH_KEY);
}

export function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAdminAuthenticated() {
  return Boolean(getAdminSession());
}
